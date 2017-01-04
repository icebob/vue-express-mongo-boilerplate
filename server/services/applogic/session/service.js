"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");
let E 			= require("../../../core/errors");

let _			= require("lodash");

module.exports = {
	name: "session",
	version: 1,

	settings: {
		latestVersion: true,
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN
	},
	
	actions: {
		// return my User model
		me(ctx) {
			return this.broker.call("profile.get");
		},

		// return all online users
		onlineUsers(ctx) {
			// TODO
		}
	},

	methods: {
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