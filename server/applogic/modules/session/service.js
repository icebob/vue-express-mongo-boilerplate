"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 			= require("../../../core/constants");

let _ 				= require("lodash");

let Sockets		= require("../../../core/sockets");

let personService;

module.exports = {
	settings: {
		name: "session",
		version: 1,
		namespace: "session",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user"
	},

	actions: {

		// return my User model
		me(ctx) {
			return Promise.resolve(ctx.user).then( (doc) => {
				return personService.toJSON(doc);
			});
		},

		// return all online users
		onlineUsers(ctx) {
			return Promise.resolve().then(() => {
				return personService.toJSON(_.map(Sockets.userSockets, (s) => s.request.user));
			});
		}
	},

	init(ctx) {
		personService = this.services("persons");
	},

	graphql: {

		query: `
			me: Person
			onlineUsers: [Person]
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
    ...personFields
  }
}


# Get list of online users
query getOnlineUser {
  onlineUsers {
    ...personFields
  }
}


fragment personFields on Person {
  code
  fullName
  email
  username
  roles
  verified
  avatar
  lastLogin
  locale
  
  posts(sort: "-createdAt") {
    code
    title
  }
}

*/