"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 			= require("../../../core/constants");

let _ 				= require("lodash");

let Sockets		= require("../../../core/sockets");
let User 			= require("../users/models/user");

module.exports = {
	name: "session",
	version: 1,
	namespace: "session",
	rest: true,
	ws: true,
	permission: C.PERM_LOGGEDIN,
	
	userModelPropFilter: "code username fullName avatar lastLogin roles",

	actions: {
		// return my User model
		me(ctx) {
			return Promise.resolve(ctx.user).then( (doc) => {
				return ctx.toJSON(doc, this.userModelPropFilter);
			});
		},

		// return all online users
		onlineUsers(ctx) {
			return Promise.resolve().then(() => {
				return ctx.toJSON(_.map(Sockets.userSockets, (s) => s.request.user), this.userModelPropFilter);
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

/*
## GraphiQL test ##

# Get my account
query me {
  me {
    ...userFields
  }
}


# Get list of online users
query getOnlineUser {
  onlineUsers {
    ...userFields
  }
}


fragment userFields on User {
	code
  fullName
  email
  username
  roles
  verified
  avatar
  lastLogin
}

*/