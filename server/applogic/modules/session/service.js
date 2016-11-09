"use strict";

let logger 			= require("../../../core/logger");
let Sockets			= require("../../../core/sockets");
let config 			= require("../../../config");

let _ 				= require("lodash");

let User 			= require("../users/models/user");

module.exports = {
	name: "session",
	version: 1,
	namespace: "session",
	rest: true,
	ws: true,
	graphql: true,
	role: "user",
	
	actions: {
		// return my User model
		me(ctx) {
			return Promise.resolve(ctx.user).then( (doc) => {
				return ctx.toJSON(doc, "password");
			});
		},

		// return all online users
		onlineUsers(ctx) {
			return Promise.resolve().then(() => {
				return ctx.toJSON(_.map(Sockets.userSockets, (s) => s.request.user), "password");
			});
		}
	},

	graphql: {

		query: `
			me: User
			onlineUsers: [User]
		`,

		mutation: `
		`,

		resolvers: {
			Query: {
				me: "me",
				onlineUsers: "onlineUsers"
			}
		}
	}

};