"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");
let E 			= require("../../../core/errors");

let _			= require("lodash");

let User 		= require("./models/user");

module.exports = {
	name: "profile",
	version: 1,

	settings: {
		latestVersion: true,
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		collection: User,

		hashedIdentity: true,
		modelPropFilter: "code username fullName email avatar passwordLess provider profile socialLinks roles apiKey lastLogin locale status createdAt updatedAt"
	},
	
	actions: {
		// return my profile with all properties
		get: {
			cache: false, // can't be cached, because it is unique for every account
			handler(ctx) {
				return Promise.resolve(ctx)
				.then(ctx => User.findById(ctx.params.$user.id).exec())
				.then(doc => this.toJSON(doc))
				.then(json => this.populateModels(ctx, json));
			}
		},

		update(ctx) {
			// TODO: save profile changes
		}
	},

	methods: {
	},

	graphql: {

		query: `
			profile: Profile
		`,

		types: `
			type Profile {
				code: String!
				fullName: String
				email: String
				username: String
				passwordLess: Boolean
				provider: String
				profile: SocialProfile
				socialLinks: SocialLinks
				roles: [String]
				verified: Boolean
				apiKey: String
				locale: String
				avatar: String
				createdAt: Timestamp
				updatedAt: Timestamp
				lastLogin: Timestamp
				status: Boolean
			}

			type SocialProfile {
				name: String
				gender: String
				picture: String
				location: String
			}

			type SocialLinks {
				facebook: String
				twitter: String
				google: String
				github: String
			}
		`,		

		mutation: `
		`,

		resolvers: {
			Query: {
				profile: "get"
			}
		}
	}

};

/*
## GraphiQL test ##

# Get a person
query getProfile {
  profile {
    ...profileFields
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