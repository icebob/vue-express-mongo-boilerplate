"use strict";

// let ROOT 			= "../../../";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let _ 				= require("lodash");
let express			= require("express");

let auth			= require("../../../core/auth/helper");
let response		= require("../../../core/response");

let io				= require("../../../core/socket");
let User			= require("../../../models/user");

let namespace = "/session";

function pickUserProps(user) {
	return _.pick(user, [
		"fullName",
		"email",
		"username",
		"roles",
		"lastLogin"
	]);
}

module.exports = function(app, db) {

	let router = express.Router();

	// Must be authenticated
	router.use(auth.isAuthenticatedOrApiKey);

	// Get current logged in user
	router.get("/me", function(req, res) {
		response.json(res, req.user.pick([
			"code",
			"fullName",
			"email",
			"username",
			"roles",
			"lastLogin",
			"gravatar",

			"provider",
			"profile",
			"socialLinks",
			"apiKey",
			"passwordLess"
		]));
	});

	router.get("/onlineUsers", function(req, res) {
		let users = _.map(io.onlineUsers, function(user) {
			return user.pick();
		});

		response.json(res, users);
	});

	// API versioning
	app.use("/v1" + namespace, router);

	// v1 is the default route
	app.use(namespace, router);
};