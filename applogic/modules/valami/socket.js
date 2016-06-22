"use strict";

let logger 			= require('../../../core/logger');
let config 			= require("../../../config");

module.exports = function(io, socket) {

	socket.on("welcome", function(msg) {
		logger.info("Incoming welcome message from " + socket.request.user.username + ":", msg);
	});

	socket.on("inc", function(msg) {
		logger.info("Increment:", msg);
	});

};