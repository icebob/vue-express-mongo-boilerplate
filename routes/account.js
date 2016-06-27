"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');

let secrets 	= require('../core/secrets');
let tokgen 		= require('../libs/tokgen');

let crypto = require('crypto');
let async = require("async");
let passport = require('passport');
let express = require("express");

let response = require("../core/response");
let mailer = require("../libs/mailer");

let User = require("../models/user");

function checkAvailableSocialAuth() {
	// set social options
	let social = {};

	if (secrets.apiKeys) {
		if (secrets.apiKeys.google && secrets.apiKeys.google.clientID)
			social.google = true;

		if (secrets.apiKeys.facebook && secrets.apiKeys.facebook.clientID)
			social.facebook = true;

		if (secrets.apiKeys.github && secrets.apiKeys.github.clientID)
			social.github = true;

		if (secrets.apiKeys.twitter && secrets.apiKeys.twitter.clientID)
			social.twitter = true;
	}

	if (Object.keys(social).length > 0)
		return social;

	return null;
}

module.exports = function(app, db) {

	// Login page
	app.get('/login', function(req, res) {
		if (req.user != null) {
			return res.redirect("/");
		}

		res.render('account/login', {
			socialAuth: checkAvailableSocialAuth()
		});
	});

	// Logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect("/");
	});

	// Sign-up
	app.get('/signup', function(req, res) {
		res.render('account/signup', {
			socialAuth: checkAvailableSocialAuth()
		});

	});	

	// User registration
	app.post("/signup", function(req, res) {

		req.assert("name", "Name cannot be empty!").notEmpty();
		req.assert("email", "Email cannot be empty!").notEmpty();
		req.assert("email", "Email is not valid!").isEmail();
		req.sanitize('email').normalizeEmail({ remove_dots: false });

		//req.assert("username", "Username cannot be empty!").notEmpty();
		
		if (!req.body.username)
			req.body.username = req.body.email;

		req.sanitize('passwordless').toBoolean();
		let passwordless = req.body.passwordless === true;
		if (!passwordless) {
			req.assert("password", "Password cannot be empty!").notEmpty();
		}

		var errors = req.validationErrors();

		if (errors) {
			req.flash('error', errors);
			return res.redirect('/signup');
		}

		async.waterfall([

			function generateVerificationToken(done) {
				if (config.verificationRequired) {
					crypto.randomBytes(25, function(err, buf) {
						done(err, err ? null : buf.toString("hex"))
					});
				} else {
					done(null, null);
				}
			},

			function passwordless(token, done) {
				if (passwordless) {
					crypto.randomBytes(25, function(err, buf) {
						done(err, token, err ? null : buf.toString("hex"));
					});
				}
				else
					done(null, token, req.body.password);
			},

			function createUser(token, password, done) {

				let user = new User({
					fullName: req.body.name,
					email: req.body.email,
					username: req.body.username,
					password: password,
					roles: ["user"],
					provider: "local"
				});

				if (token) {
					user.verified = false;
					user.verifyToken = token;
				} else {
					user.verified = true;
				}

				user.save(function(err, user) {
					if (err && err.code === 11000) {
						let field = err.message.split(".$")[1];
						field = field.split(" dup key")[0];
						field = field.substring(0, field.lastIndexOf("_"));						
						if (field == "email")
							req.flash('error', { msg: 'An account with that email address already exists!' });
						else 
							req.flash('error', { msg: 'An account with that username already exists!' });
					}
					done(err, user);
				});
			},

			function sendEmail(user, done) {
				if (user.verified) {
					// Send welcome email
					let subject = '✔ Welcome to ' + config.app.title + "!";

					res.render('mail/welcome', {
						name: user.fullName
					}, function(err, html) {
						if (err)
							return done(err);

						mailer.send(user.email, subject, html, function(err, info) {
							if (err)
								req.flash("error", { msg: "Unable to send email to " + user.email});
							else
								req.flash("info", { msg: 'Please check your email to verify your account. Thanks for signing up!'});

							done(null, user);
						});
					});	

				} else {
					// Send verification email
					let subject = '✔ Activate your new ' + config.app.title + ' account';

					res.render('mail/accountVerify', {
						name: user.fullName,
						validateLink: 'http://' + req.headers.host + '/verify/' + user.verifyToken
					}, function(err, html) {
						if (err)
							return done(err);

						mailer.send(user.email, subject, html, function(err, info) {
							if (err)
								req.flash("error", { msg: "Unable to send email to " + user.email});
							else
								req.flash("info", { msg: 'Please check your email to verify your account. Thanks for signing up!'});


							done(err, user);
						});
					});					
				}
			},

		], function(err, user) {
			if (err) {
				logger.error(err);
				return res.redirect("back");
			}

			if (user.verified) {
				req.login(user, function(err) {
					if (err)
						logger.error(err);

					return res.redirect("/");
				});
			}
			else
				res.redirect("/signup");
		});
	});


	// Verify account
	app.get('/verify/:token', function(req, res) {
		if (req.isAuthenticated())
			return res.redirect('/');
		
		async.waterfall([

			function checkToken(done) {
				User			
					.findOne({ verifyToken: req.params.token })
					.exec( (err, user) => {
						if (err) 
							return done(err);

						if (!user) {
							req.flash('error', { msg: 'Your account verification is invalid or expired.' });
							return done("Verification is invalid!");
						}

						user.verified = true;
						user.verifyToken = undefined;
						user.lastLogin = Date.now();

						user.save(function(err) {
							if (err) {
								req.flash('error', { msg: 'Unable to modify your account!' });
								return done(err);
							}

							done(null, user);
						});
					});			
			},

			function sendWelcomeEmailToUser(user, done) {
				let subject = '✔ Welcome to ' + config.app.title + "!";

				res.render('mail/welcome', {
					name: user.fullName
				}, function(err, html) {
					if (err)
						return done(err);

					mailer.send(user.email, subject, html, function(err, info) {
						if (err)
							req.flash("error", { msg: "Unable to send email to " + user.email});
						else
							req.flash("info", { msg: 'Please check your email to verify your account. Thanks for signing up!'});

						done(null, user);
					});
				});	
			},

			function loginUser(user, done) {
				req.login(user, function(err) {
					done(err, user);
				});				
			}

		], function(err) {
			if (err) {
				logger.error(err);
				return res.redirect("/signup");
			}

			res.redirect("/");
		});
	});	

	// Passwordless login
	app.get('/passwordless/:token', function(req, res) {
		if (req.isAuthenticated())
			return res.redirect('/');
		
		async.waterfall([

			function checkToken(done) {
				User			
					.findOne({ passwordLessToken: req.params.token })
					.exec( (err, user) => {
						if (err) 
							return done(err);

						if (!user) {
							req.flash('error', { msg: 'Your passwordless token is invalid or expired.' });
							return done("Token is invalid!");
						}

						user.passwordLessToken = undefined;
						if (!user.verified) {
							user.verified = true;
							user.verifyToken = undefined;
						}
						user.lastLogin = Date.now();

						user.save(function(err) {
							if (err) {
								req.flash('error', { msg: 'Unable to modify account details!' });
								return done(err);
							}

							done(null, user);
						});
					});			
			},

			function loginUser(user, done) {
				req.login(user, function(err) {
					done(err, user);
				});				
			}

		], function(err) {
			if (err) {
				logger.error(err);
				return res.redirect("/login");
			}

			res.redirect("/");
		});
	});	

	// Forgot password
	app.get('/forgot', function(req, res) {
		if (req.isAuthenticated())
			return res.redirect('/');
		
		res.render("account/forgot");
	});	

	// Forgot password
	app.post('/forgot', function(req, res) {
		req.assert('email', 'Email is not valid!').isEmail();
		req.assert('email', 'Email cannot be blank!').notEmpty();
		req.sanitize('email').normalizeEmail({ remove_dots: false });
		
		let errors = req.validationErrors();
		if (errors) {
			req.flash('error', errors);
			return res.redirect('back');
		}	

		async.waterfall([

			function generateToken(done) {
				crypto.randomBytes(25, function(err, buf) {
					done(err, err ? null : buf.toString("hex"))
				});
			},

			function getUserAndSaveToken(token, done) {
				User.findOne({ email: req.body.email }, function(err, user) {
					if (!user) {
						req.flash('error', { msg: 'The email address ' + req.body.email + ' is not associated with any account.' });
						return done("Email address " + req.body.email + " is not registered!");
					}

					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + 3600000; // expire in 1 hour
					user.save(function(err) {
						done(err, token, user);
					});					
				});
			},

			function sendResetEmailToUser(token, user, done) {
				let subject = '✔ Reset your password on ' + config.app.title;

				res.render('mail/passwordReset', {
					name: user.fullName,
					resetLink: 'http://' + req.headers.host + '/reset/' + token
				}, function(err, html) {
					if (err)
						return done(err);
					
					mailer.send(user.email, subject, html, function(err, info) {
						if (err)
							req.flash("error", { msg: "Unable to send email to " + user.email});
						else
							req.flash("info", { msg: "An email has been sent to " + user.email + " with further instructions."});

						done(err);
					});
				});
			}

		], function(err) {
			if (err)
				logger.error(err);

			res.redirect('back');
		});
	});	



	// Reset password
	app.get('/reset/:token', function(req, res) {
		if (req.isAuthenticated())
			return res.redirect('/');
		
		User
			.findOne({ resetPasswordToken: req.params.token })
			.where('resetPasswordExpires').gt(Date.now())
			.exec((err, user) => {
				if (err) 
					return next(err);

				if (!user) {
					req.flash('error', { msg: 'Password reset token is invalid or has expired.' });
					return res.redirect('/forgot');
				}

				res.render('account/reset');
			});
	});

	// Reset password
	app.post("/reset/:token", function(req, res, next) {
		req.assert('password', 'Password must be at least 6 characters long.').len(6);
		req.assert('confirm', 'Passwords must match.').equals(req.body.password);

		const errors = req.validationErrors();
		if (errors) {
			req.flash('error', errors);
			return res.redirect('back');
		}

		async.waterfall([

			function checkTokenAndExpires(done) {
				User			
					.findOne({ resetPasswordToken: req.params.token })
					.where('resetPasswordExpires').gt(Date.now())
					.exec( (err, user) => {
						if (err) 
							return done(err);

						if (!user) {
							req.flash('error', { msg: 'Password reset token is invalid or has expired.' });
							return done('Password reset token is invalid or has expired.');
						}

						// Clear passwordless flag, if the user change password
						if (user.passwordLess)
							user.passwordLess = false;

						user.password = req.body.password;
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;
						user.lastLogin = Date.now();

						user.save(function(err) {
							if (err) 
								return done(err);
							
							req.login(user, function(err) {
								done(err, user);
							});
						});
					});			
			},

			function sendPasswordChangeEmailToUser(user, done) {
				let subject = '✔ Your password has been changed on ' + config.app.title;

				res.render('mail/passwordChange', {
					name: user.fullName
				}, function(err, html) {
					if (err)
						return done(err);

					mailer.send(user.email, subject, html, function(err, info) {
						if (err)
							req.flash("error", { msg: "Unable to send email to " + user.email});
						else
							req.flash("info", { msg: "Success! Your password has been changed."});

						done(err);
					});
				});
			}

		], function(err) {
			if (err) {
				logger.error(err);
				return res.redirect('back');
			}

			res.redirect("/");
		});
	});

	// Generate API key
	app.get('/generateAPIKey', function(req, res) {
		if (!req.isAuthenticated())
			return response.json(res, null, response.UNAUTHORIZED);
		
		User
			.findById(req.user.id)
			.exec((err, user) => {
				if (err) 
					return response.json(res, null, response.SERVER_ERROR);

				if (!user) {
					return response.json(res, null, response.NOT_FOUND, "Invalid user!");
				}

				user.apiKey = tokgen();

				user.save((err) => {
					if (err) 
						return response.json(res, null, response.SERVER_ERROR);

					return response.json(res, user);
				})

			});
	});	
};
