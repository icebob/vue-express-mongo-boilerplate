"use strict";

let logger 			= require('../../../core/logger');
let config 			= require("../../../config");

let store 			= require("./memstore");

module.exports = function(io, socket) {

	socket.on("welcome", function(msg) {
		logger.info("Incoming welcome message from " + socket.request.user.username + ":", msg);

		// Send the last value to counter
		socket.emit("counter", store.counter);
	});

	socket.on("counter", function(msg) {
		store.counter = msg;
		logger.info(socket.request.user.username + " increment the counter to ", store.counter);
		socket.broadcast.emit("counter", store.counter);
	});

};