"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

module.exports = {

	namespace: "/devices",
	//role: "admin",

	init(io) {
		io.on("connection", (socket) => {

			// Handle imcoming websocket messages
			// 
			// For example:
			// 
			// 	socket.on("message", function(payload) {
			// 		console.log(payload + " received from " + socket.request.user.username);
			// 	}
			// 	
			
		});		
	}
};