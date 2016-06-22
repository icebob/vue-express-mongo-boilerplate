"use strict";

let logger 			= require('../../core/logger');
let config 			= require("../../config");

let auth			= require("../../core/auth/helper");

module.exports = function(app, db) {

	// Valami
	app.get('/valami', auth.isAuthenticated, function(req, res) {
		res.send("Valami");
	});

};