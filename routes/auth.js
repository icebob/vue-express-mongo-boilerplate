"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');

let crypto = require('crypto');
let async = require("async");

let passport = require('passport');
let express = require("express");

let mailer = require("../libs/mailer");

let User = require("../models/user");


function response(req, res, redirect) {
	if (req.accepts('json') && !req.accepts('html')) {

		let result = {};

		//console.log(req.session.flash);
		if (req.session.flash && req.session.flash.error && req.session.flash.error.length > 0)
			result.error = req.session.flash.error;
		else
			result.result = "OK";

		//console.log(result);
		return res.json(result);
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
			return response(req, res, '/login');
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
						res.redirect('/');
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
								req.flash("info", { msg: "An email has been sent to " + user.email + " with login link."});

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

	app.use("/auth", authRouter);
};
