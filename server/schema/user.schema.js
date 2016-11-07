"use strict";

// let ROOT 			= "../";

let logger 			= require("../core/logger");
let config 			= require("../config");

let _ 				= require("lodash");
let C 				= require("../core/constants");

let Post 			= require("../applogic/modules/posts/models/post");
let User 			= require("../models/user");

let helper			= require("../libs/schema-helper");

const query = `
	users(limit: Int, offset: Int, sort: String): [User]
	user(id: Int, code: String): User
`;

const typeDefinitions = `
type User {
	id: Int!
	code: String!
	fullName: String
	email: String
	username: String
	provider: String
	roles: [String]
	verified: Boolean
	gravatar: String
	lastLogin: Timestamp
	posts(limit: Int, offset: Int, sort: String): [Post]
}
`;

const mutation = `
`;

const resolvers = {
	Query: {

		users(root, args, context) {
			if (!helper.hasRole(context, C.ROLE_ADMIN)) 
				return null;

			return helper.applyLimitOffsetSort(User.find({}), args).exec();
		},

		user(root, args, context) {
			if (!helper.hasRole(context, C.ROLE_ADMIN))
				return null;

			let id = args.id;

			if (args.code)
				id = User.schema.methods.decodeID(args.code);

			if (id)
				return User.findById(id).exec();
		}

	},

	User: {
		posts(author, args, context) {
			if (!helper.hasRole(context, C.ROLE_USER))
				return null;
				
			return helper.applyLimitOffsetSort(Post.find({ author: author.id }), args).exec();
		}
	},

	Mutation: {
	}

};

module.exports = {
	schema: {
		query,
		typeDefinitions,
		mutation
	},
	resolvers
};
