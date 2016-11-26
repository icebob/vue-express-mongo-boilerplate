"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let Sockets		= require("../../../core/sockets");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let User 		= require("./models/user");

module.exports = {
	settings: {
		name: "persons",
		version: 1,
		namespace: "persons",
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
		/*find: {
			cache: true,
			handler(ctx) {
				return ctx.queryPageSort(User.find({})).exec().then( (docs) => {
					return this.toJSON(docs);
				})
				.then((json) => {
					return this.populateModels(json);					
				});
			}
		},*/

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
			# users(limit: Int, offset: Int, sort: String): [Person]
			person(code: String): Person
		`,

		types: `
			type Person {
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
				//users: "find",
				person: "get"
			},

			Person: {
				posts(person, args, context) {
					let ctx = context.ctx;
					let postService = ctx.services("posts");
					if (postService)
						return postService.actions.find(ctx.copy(Object.assign(args, { author: person.code })));
				}
			}
		}
	}

};

/*
## GraphiQL test ##

# Get a person
query getPerson {
  person(code: "O5rNl5Bwnd") {
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