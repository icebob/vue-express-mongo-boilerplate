"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');

let crypto = require('crypto');
let async = require("async");
let passport = require('passport');
let express = require("express");

let mailer = require("../libs/mailer");

let User = require("../models/user");

module.exports = function(app, db) {

	// Login page
	app.get('/login', function(req, res) {
		if (req.user != null) {
			return res.redirect("/");
		}
		res.render('account/login');
	});

	// Logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect("/");
	});

	// Sign-up
	app.get('/signup', function(req, res) {
		res.render("account/signup");
	});	

	// User registration
	app.post("/signup", function(req, res) {

		req.assert("name", "Name cannot be empty!").notEmpty();
		req.assert("email", "Email cannot be empty!").notEmpty();
		req.assert("email", "Email is not valid!").isEmail();
		req.assert("username", "Username cannot be empty!").notEmpty();
		req.assert("password", "Password cannot be empty!").notEmpty();
		req.sanitize('email').normalizeEmail({ remove_dots: false });

		var errors = req.validationErrors();

		if (errors) {
			req.flash('error', errors);
			return res.redirect('/signup');
		}

		let user = new User({
			fullName: req.body.name,
			email: req.body.email,
			username: req.body.username,
			password: req.body.password,
			roles: ["user"],
			provider: "local"
		});

		user.save(function(err) {
			if (err)
				return res.send(400, err);
			
			req.login(user, function(err) {
				if (err)
					return res.send(400, err);

				res.redirect("/");
			});
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
			return res.redirect('/forgot');
		}	

		async.waterfall([

			function generateToken(done) {
				crypto.randomBytes(16, function(err, buf) {
					done(err, err ? null : buf.toString("hex"))
				});
			},

			function getUserAndSaveToken(token, done) {
				User.findOne({ email: req.body.email }, function(err, user) {
					if (!user) {
						req.flash('error', { msg: 'The email address ' + req.body.email + ' is not associated with any account.' });
						return res.redirect('/forgot');
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
					if (err) {
						logger.error(err);
						return res.status(500).send("Server error");
					}
					/*
					let body =  'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
								'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
								'http://' + req.headers.host + '/reset/' + token + '\n\n' +
								'If you did not request this, please ignore this email and your password will remain unchanged.\n';
					*/
					mailer.send(user.email, subject, html, function(err, info) {
						if (err)
							req.flash("error", { msg: "Unable to send email to " + user.email});
						else
							req.flash("info", { msg: "An email has been sent to " + user.email + " with further instructions."});

						res.redirect("/forgot");
					});
				});
			}

		]);
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
							return next(err);

						if (!user) {
							req.flash('error', { msg: 'Password reset token is invalid or has expired.' });
							return res.redirect('back');
						}

						user.password = req.body.password;
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function(err) {
							if (err) 
								return next(err);
							
							req.login(user, function(err) {
								done(err, user);
							});
						});
					});			
			},

			function sendPasswordChangeEmailToUser(user, done) {
				let subject = 'Your password has been changed on ' + config.app.title;
				let body =  'Hello,\n\nThis is a confirmation that the password for your account ' + user.email + ' has just been changed.\n';

				mailer.send(user.email, subject, body, function(err, info) {
					req.flash("info", { msg: "Success! Your password has been changed."});
					done();
				});
			}

		], function(err) {
			if (err)
				return next(err);

			res.redirect("/");
		});
	});
};
