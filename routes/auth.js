"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');

let passport = require('passport');
let express = require("express");

let User = require("../models/user");

module.exports = function(app, db) {

	// Login page
	app.get('/login', function(req, res) {
		if (req.user != null) {
			return res.redirect("/");
		}
		res.render('login');
	});

	// Logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect("/");
	});

	// Sign-up
	app.get('/signup', function(req, res) {
		res.render("signup");
	});	

	// User registration
	app.post("/signup", function(req, res) {

		req.assert("name", "Name cannot be empty!").notEmpty();
		req.assert("email", "Email cannot be empty!").notEmpty();
		req.assert("email", "Email is not valid!").isEmail();
		req.assert("username", "Username cannot be empty!").notEmpty();
		req.assert("password", "Password cannot be empty!").notEmpty();

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
			
			req.user = user;
			return res.redirect("/");
		});
	});

	let authRouter = express.Router();

	authRouter.post('/local', passport.authenticate('local', { 
		failureRedirect: '/login',
		failureFlash: 'Invalid username or password!',

	}), function(req, res) {
		// Update user's record with login time
		req.user.lastLogin = Date.now();
		req.user.save(function() {
			// Remove sensitive data before login
			req.user.password = undefined;
			req.user.salt = undefined;
			res.redirect('/');
		});

	});

	app.use("/auth", authRouter);
};
