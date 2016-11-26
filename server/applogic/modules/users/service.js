"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let Sockets		= require("../../../core/sockets");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let User 		= require("./models/user");

module.exports = {
	settings: {
		name: "users",
		version: 1,
		namespace: "users",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: User,

		modelPropFilter: "code username fullName avatar lastLogin roles"
	},
	
	actions: {
		// return all model
		find: {
			cache: true,
			handler(ctx) {
				return ctx.queryPageSort(User.find({})).exec().then( (docs) => {
					return this.toJSON(docs);
				})
				.then((json) => {
					return this.populateModels(json);					
				});
			}
		},

		// return a model by ID
		get: {
			cache: true,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:UserNotFound"));
				return Promise.resolve(ctx.model);
			}
		}
	},

	methods: {
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

				posts(limit: Int, offset: Int, sort: String): [Post]
			}
		`,		

		mutation: `
		`,

		resolvers: {
			Query: {
				users: "find",
				user: "get"
			},

			User: {
				posts(user, args, context) {
					let ctx = context.ctx;
					let postService = ctx.services("posts");
					if (postService)
						return postService.actions.find(ctx.copy(Object.assign(args, { user: user.code })));
				}
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
  user(code: "O5rNl5Bwnd") {
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
  
  posts(sort: "-createdAt") {
    code
    title
  }
}

*/