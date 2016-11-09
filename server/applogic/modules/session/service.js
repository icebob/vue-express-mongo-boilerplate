"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _ 			= require("lodash");

let Sockets		= require("../../../core/sockets");
let User 		= require("../users/models/user");

module.exports = {
	name: "session",
	version: 1,
	namespace: "session",
	rest: true,
	ws: true,
	graphql: true,
	role: C.ROLE_USER,
	
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