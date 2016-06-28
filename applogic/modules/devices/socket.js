"use strict";

let logger 			= require('../../../core/logger');
let config 			= require("../../../config");

module.exports = {

	namespace: "/devices",

	init(io) {
		io.on("connection", (socket) => {

			// Handle imcoming messages
			
		});		
	}
}