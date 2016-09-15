"use strict";

//let ROOT 			= "../../../";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let auth			= require("../../../core/auth/helper");
let store 			= require("./memstore");

module.exports = function(app, db) {

	// Get current value of counter
	app.get("/counter", auth.isAuthenticated, function(req, res) {
		res.send("Hello Counter! " + store.counter);
	});

};