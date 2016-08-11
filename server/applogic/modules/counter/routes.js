"use strict";

let ROOT 			= "../../../";

let logger 			= require(ROOT + "core/logger");
let config 			= require(ROOT + "config");

let auth			= require(ROOT + "core/auth/helper");
let store 			= require("./memstore");

module.exports = function(app, db) {

	// Get current value of counter
	app.get("/counter", auth.isAuthenticated, function(req, res) {
		res.send("Hello Counter! " + store.counter);
	});

};