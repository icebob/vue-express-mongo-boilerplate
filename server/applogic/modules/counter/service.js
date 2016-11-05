"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let store 			= require("./memstore");

module.exports = {

	version: 1,
	namespace: "/counter",

	actions: [

		{
			verb: "get",
			path: "/counter",
			rest: true,
			socket: true
			needAuthenticated: true,
			roles: ["user"],
			query: "Counter",

			action(req, socket, io) {
				return store.counter;
			}
		},

		{
			verb: ["get", "post", "put"],
			path: "/increment",
			needAuthenticated: true,
			roles: ["user"],
			mutation: "IncrementCounter",

			action(req, socket, io) {
				store.counter++;
				logger.info(socket.request.user.username + " increment the counter to ", store.counter);
				socket.broadcast.emit("changed", store.counter);
			}
		}

	],

	socket: {
		onConnection(socket, io) {
			socket.emit("changed", store.counter);
		}
	},

	graphql: {
		query: ``,
		types: ``,
		mutations: ``,
		resolvers: {
			// Generated from actions
		}
	}

};