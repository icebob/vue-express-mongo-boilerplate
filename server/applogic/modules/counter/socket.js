"use strict";

// let ROOT 			= "../../../";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let store 			= require("./memstore");

module.exports = {

	namespace: "/counter",

	init(io) {
		io.on("connection", (socket) => {

			socket.on("changed", function(msg) {
				store.counter = msg;
				logger.info(socket.request.user.username + " increment the counter to ", store.counter);
				socket.broadcast.emit("changed", store.counter);
			});

			socket.emit("changed", store.counter);

		});
	}
};