"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');

let passport = require('passport');
let express = require("express");

let User = require("../models/user");

module.exports = function(app, db) {

	let authRouter = express.Router();

	authRouter.post('/local', function(req, res, next) {

		req.assert('username', 'Username cannot be blank!').notEmpty();
		//req.assert('email', 'Email is not valid!').isEmail();
		//req.assert('email', 'Email cannot be blank!').notEmpty();
		req.assert('password', 'Password cannot be blank!').notEmpty();
		//req.sanitize('email').normalizeEmail({ remove_dots: false });

		let errors = req.validationErrors();
		if (errors) {
			req.flash('error', errors);
			return res.redirect('/login');
		}

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

	});

	app.use("/auth", authRouter);
};
