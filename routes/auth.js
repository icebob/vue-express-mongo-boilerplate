"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');

let crypto = require('crypto');
let async = require("async");

let passport = require('passport');
let express = require("express");

let mailer = require("../libs/mailer");

let User = require("../models/user");

let Response = require("../core/response");

function response(req, res, redirect, err) {
	if (req.accepts('json') && !req.accepts('html')) {

		let flash = req.flash();

		if (flash && flash.error && flash.error.length > 0) {

			let errMessage = flash.error[0].msg;
			Response.json(res, null, err || Response.REQUEST_FAILED, errMessage);
		}
		else {
			let successData = "OK";
			if (flash && flash.info && flash.info.length > 0)
				successData = flash.info[0].msg;
			Response.json(res, successData);
		}

	}
	else if (redirect)
		res.redirect(redirect);
}

module.exports = function(app, db) {

	let authRouter = express.Router();

	authRouter.post('/local', function(req, res, next) {

		req.assert('username', 'Username cannot be blank!').notEmpty();
		//req.assert('email', 'Email is not valid!').isEmail();
		//req.assert('email', 'Email cannot be blank!').notEmpty();
		//req.sanitize('email').normalizeEmail({ remove_dots: false });

		// Passwordless miatt
		//req.assert('password', 'Password cannot be blank!').notEmpty();

		let errors = req.validationErrors();
		if (errors) {
			req.flash('error', errors);
			return response(req, res, '/login', Response.BAD_REQUEST);
		}

		if (req.body.password) {
			// Login with password
			passport.authenticate('local', function(err, user, info) { 
				if (!user) {
					req.flash('error', { msg: info.message });
					return response(req, res, '/login');
				}

				req.login(user, function(err) {
					if (err) {
						req.flash('error', { msg: err });
						return response(req, res, '/login');
					}

					// Update user's record with login time
					req.user.lastLogin = Date.now();
					req.user.save(function() {
						// Remove sensitive data before login
						req.user.password = undefined;
						req.user.salt = undefined;
						response(req, res, '/');
					});

				});

			})(req, res, next);

		} else {
			// Passwordless login
			async.waterfall([

				function generateToken(done) {
					crypto.randomBytes(25, function(err, buf) {
						done(err, err ? null : buf.toString("hex"))
					});
				},

				function getUser(token, done) {
					let username = req.body.username;
					User.findOne({ username: username }, function(err, user) {
						if (!user) {
							req.flash('error', { msg: 'The username ' + username + ' is not associated with any account.' });
							return done("Invalid username " + username);
						}

						user.passwordLessToken = token;
						//user.passwordLessTokenExpires = Date.now() + 3600000; // expire in 1 hour
						user.save(function(err) {
							done(err, token, user);
						});					
					});
				},

				function sendResetEmailToUser(token, user, done) {
					let subject = '✔ Login to your account on ' + config.app.title;

					res.render('mail/passwordLessLogin', {
						name: user.fullName,
						loginLink: 'http://' + req.headers.host + '/passwordless/' + token
					}, function(err, html) {
						if (err)
							return done(err);

						mailer.send(user.email, subject, html, function(err, info) {
							if (err)
								req.flash("error", { msg: "Unable to send email to " + user.email});
							else
								req.flash("info", { msg: "An email has been sent to " + user.email + " with magic link. Please check your spam folder if it does not arrive."});

							done(err);
						});
					});
				}

			], function(err, user) {
				if (err) {
					logger.error(err);
				}

				response(req, res, "back");
			});
		}

	});

	// Available scopes: https://developers.google.com/+/web/api/rest/oauth#authorization-scopes
	authRouter.get('/google', passport.authenticate('google', {
		scope: 'profile email'
		/*scope: [
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/plus.profile.emails.read'
		]*/
	}));

	authRouter.get('/google/callback', passport.authenticate('google', {
		failureRedirect: '/login'
	}), function(req, res) {
		res.redirect("/");
	});

	authRouter.get('/facebook', passport.authenticate('facebook', {
		scope: ['email', 'user_location']
	}));

	authRouter.get('/facebook/callback', passport.authenticate('facebook', {
		failureRedirect: '/login'
	}), function(req, res) {
		res.redirect("/");
	});	

	authRouter.get('/twitter', passport.authenticate('twitter'));

	authRouter.get('/twitter/callback', passport.authenticate('twitter', {
		failureRedirect: '/login'
	}), function(req, res) {
		res.redirect("/");
	});	

	authRouter.get('/github', passport.authenticate('github', {
		scope: "user:email"
	}));

	authRouter.get('/github/callback', passport.authenticate('github', {
		failureRedirect: '/login'
	}), function(req, res) {
		res.redirect("/");
	});	

	app.use("/auth", authRouter);
};
