"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let Sockets		= require("../../../core/sockets");
let C 	 		= require("../../../core/constants");

let User 		= require("./models/user");

module.exports = {
	name: "users",
	version: 1,
	namespace: "users",
	rest: true,
	ws: true,
	permission: C.PERM_LOGGEDIN,
	model: User,
	idParamName: "code", // GET /users/find?code=bD6kd

	modelPropFilter: "code username fullName avatar lastLogin roles",
	
	actions: {
		// return all model
		find(ctx) {
			return ctx.queryPageSort(User.find({})).exec().then( (docs) => {
				return ctx.toJSON(docs);
			});
		},

		// return a model by ID
		get(ctx) {
			if (!ctx.model)
				throw ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:UserNotFound"));

			return Promise.resolve(ctx.model).then( (doc) => {
				return ctx.toJSON(doc);
			});
		}
	},

	// resolve model by ID		
	modelResolver(ctx, code) {
		let id = User.schema.methods.decodeID(code);
		if (id == null || id == "")
			return ctx.errorBadRequest(C.ERR_INVALID_CODE, ctx.t("app:InvalidCode"));

		return User.findById(id).exec();		
	},	

	graphql: {

		query: `
			users(limit: Int, offset: Int, sort: String): [User]
			user(code: String): User
		`,

		types: `
			type User {
				code: String!
				fullName: String
				email: String
				username: String
				provider: String
				roles: [String]
				verified: Boolean
				locale: String
				avatar: String
				lastLogin: Timestamp
				status: Int
			}
		`,
		// posts(limit: Int, offset: Int, sort: String): [Post]

		mutation: `
		`,

		resolvers: {
			Query: {
				users: "find",
				user: "get"
			}
		}
	}

};

/*
## GraphiQL test ##

# Find all users
query getUsers {
  users(sort: "-lastLogin", limit: 3) {
    ...userFields
  }
}

# Get a user
query getUser {
  user(code: "jQalr8wqZo") {
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
  locale
  status
}

*/