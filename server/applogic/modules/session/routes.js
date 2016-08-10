"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let express			= require("express");

let auth			= require("../../../core/auth/helper");
let response		= require("../../../core/response");

let namespace = "/session";

module.exports = function(app, db) {

	let router = express.Router();

	// Must be authenticated
	router.use(auth.isAuthenticatedOrApiKey);


	// Get current logged in user
	router.get("/me", auth.isAuthenticated, function(req, res) {
		let user = req.user.toJSON();
		delete user._id;
		delete user.id;
		delete user.__v;
		response.json(res, user);
	});

	// API versioning
	app.use("/v1" + namespace, router);

	// v1 is the default route
	app.use(namespace, router);
};