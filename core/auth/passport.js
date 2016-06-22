"use strict";

let logger = require('../logger');
let config = require("../../config");

let passport = require('passport');
let path = require('path');

let User = require('../../models/user');

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
		}, '-password', function(err, user) {
			return done(err, user);
		});
	});

	logger.info("");
	logger.info("Search passport strategies...");

	return config.getGlobbedFiles(path.join(__dirname, 'strategies', '**', '*.js')).forEach(function(strategy) {
		logger.info("  Loading passport strategy file " + path.basename(strategy) + "...");
		return require(path.resolve(strategy))();
	});
};
