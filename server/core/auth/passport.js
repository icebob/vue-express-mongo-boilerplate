"use strict";

let logger 			= require("../logger");
let config 			= require("../../config");

let passport 		= require("passport");
let path 			= require("path");
let chalk 			= require("chalk");

/* global WEBPACK_BUNDLE */
if (!WEBPACK_BUNDLE) require("require-webpack-compat")(module, require);

let User 			= require("../../models/user");

module.exports = function(app) {

	// Use passport session
	app.use(passport.initialize());
	app.use(passport.session());	

	passport.serializeUser(function(user, done) {
		return done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findOne({
			_id: id
		}, "-password", function(err, user) {
			if (err)
				return done(err);
			
			// Check that the user is not disabled or deleted
			if (!user || user.status !== 1)
				return done(null, false);

			return done(null, user);
		});
	});

	logger.info("");
	logger.info(chalk.bold("Search passport strategies..."));

	function requireAll(r) { 
		return r.keys().map(function(module) {
			logger.info("  Loading passport strategy file " + path.basename(module) + "...");
			let strategy = r(module);
			strategy();

			return strategy;
		});
	}
	let modules = requireAll(require.context("./strategies", true, /\.js$/));
};
