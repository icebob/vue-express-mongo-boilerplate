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
			return res.redirect('/login');
		}

		if (req.body.password) {
			// Login with password
			passport.authenticate('local', function(err, user, info) { 
				if (!user) {
					req.flash('error', { msg: info.message });
					return res.redirect("/login");
				}

				req.login(user, function(err) {
					if (err) {
						req.flash('error', err);
						return res.redirect("/login");
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
							done("Invalid username " + username);
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
						if (err) {
							logger.error(err);
							done();
							return res.status(500).send("Server error");
						}
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
					logger.err(err);
				}

				res.redirect("back");
			});
		}

	});

	app.use("/auth", authRouter);
};
