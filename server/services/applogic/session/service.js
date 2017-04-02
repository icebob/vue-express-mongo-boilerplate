"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");
let E 			= require("../../../core/errors");

let _			= require("lodash");

module.exports = {
	name: "session",
	//version: 1,

	settings: {
		//latestVersion: true,
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN
	},
	
	actions: {
		// return my User model
		me(ctx) {
			return ctx.call("profile.get", ctx.params);
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
			me: Profile
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
    ...profileFields
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
  username
  roles
  avatar
  lastLogin
  
  posts(sort: "-createdAt") {
    code
    title
  }
}

fragment profileFields on Profile {
	code
	fullName
	email
	username
	passwordLess
	provider
	profile {
		name
		gender
		picture
		location
	}
	socialLinks {
		facebook
		twitter
		google
		github
	}
	roles
	verified
	apiKey
	locale
	avatar
	createdAt
	updatedAt
	lastLogin
	status  
}

*/