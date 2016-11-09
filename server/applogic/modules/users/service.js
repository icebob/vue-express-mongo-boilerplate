"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let User 			= require("./models/user");

module.exports = {
	name: "users",
	version: 1,
	namespace: "users",
	rest: true,
	ws: true,
	graphql: true,
	role: "user",
	model: User,
	idParamName: "code", // GET /users/find?code=bD6kd
	
	actions: {
		// return all model
		find(ctx) {
			return ctx.queryPageSort(User.find({})).exec().then( (docs) => {
				return ctx.toJSON(docs, "password");
			});
		},

		// return a model by ID
		get(ctx) {
			if (!ctx.model)
				throw ctx.errorBadRequest(ctx.t("UserNotFound"));

			return Promise.resolve(ctx.model).then( (doc) => {
				return ctx.toJSON(doc, "password");
			});
		}
	},

	// resolve model by ID		
	modelResolver(ctx, code) {
		let id = User.schema.methods.decodeID(code);
		if (id == null || id == "")
			return Promise.reject(new Error(ctx.t("InvalidUserCode")));

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
				gravatar: String
				lastLogin: Timestamp
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