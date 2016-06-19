"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');
let auth = require("../core/auth");

let passport = require('passport');
let express = require("express");

let User = require("../models/user");

module.exports = function(app) {
	let authRouter = express.Router();

	// User registration
	authRouter.post("/signup", function(req, res) {
		let user = new User({
			fullName: req.body.fullName,
			email: req.body.email,
			username: req.body.username,
			password: req.body.password,
			roles: ["user"],
			provider: "local"
		});

		user.save(function(err) {
			if (err)
				return res.send(401, err);
			
			return res.send(200);
		});
	});
	authRouter.post("/local", function(req, res, next) {
		passport.authenticate("local", function(err, user, info) {
			var error;
			error = err || info;
			if (error)
				return res.status(401).json(error);
			
			if (!user)
				return res.status(500).json({
					message: "Something went wrong!"
				});
			
			req.login(user, function(err) {
				if (err)
					return next(err);
				
				res.redirect("/");
			});

		})(req, res, next);
	});

	app.use("/auth", authRouter);
};
