"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Post 		= require("./models/post");

module.exports = {
	name: "posts",
	version: 1,

	settings: {
		latestVersion: true,
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Post,

		modelPropFilter: "code title content author votes voters views createdAt editedAt",
		
		modelPopulates: {
			"author": "persons",
			"voters": "persons"
		}	
	},

	// Exposed actions
	actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {};

				if (ctx.params.filter == "my") 
					filter.author = ctx.user.id;
				else if (ctx.params.author != null) { 
					filter.author = this.personService.decodeID(ctx.params.author);
				}

				let query = Post.find(filter);

				return ctx.queryPageSort(query).exec().then( (docs) => {
					return this.toJSON(docs);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					return ctx.result(json);
				});
			}
		},

		// return a model by ID
		get: {
			cache: true, // if true, we can't increment the views!
			permission: C.PERM_PUBLIC,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

				return Post.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } }).exec().then( (doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					return ctx.result(json);
				});
			}
		},

		create: {
			handler(ctx) {
				this.validateParams(ctx, true);

				let post = new Post({
					title: ctx.params.title,
					content: ctx.params.content,
					author: ctx.user.id
				});

				return post.save()
				.then((doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "created", json);
					return json;
				})
				.then((json) => {
					return ctx.result(json);
				});								
			}
		},

		update: {
			permission: C.PERM_OWNER,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:PostNotFound"));
				this.validateParams(ctx);

				return this.collection.findById(ctx.modelID).exec()
				.then((doc) => {
					if (ctx.params.title != null)
						doc.title = ctx.params.title;

					if (ctx.params.content != null)
						doc.content = ctx.params.content;
					
					doc.editedAt = Date.now();
					return doc.save();
				})
				.then((doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "updated", json);
					return json;
				})
				.then((json) => {
					return ctx.result(json);
				});								
			}
		},

		remove: {
			permission: C.PERM_OWNER,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

				return Post.remove({ _id: ctx.modelID })
				.then(() => {
					return ctx.model;
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "removed", json);
					return json;
				})
				.then((json) => {
					return ctx.result(json);
				});		
			}
		},

		vote(ctx) {
			ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {		
				// Check user is on voters
				if (doc.voters.indexOf(ctx.user.id) !== -1) 
					throw ctx.errorBadRequest(C.ERR_ALREADY_VOTED, ctx.t("app:YouHaveAlreadyVotedThisPost"));
				return doc;
			})
			.then((doc) => {
				// Add user to voters
				return Post.findByIdAndUpdate(doc.id, { $addToSet: { voters: ctx.user.id } , $inc: { votes: 1 }}, { "new": true });
			})
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "voted", json);
				return json;
			})
			.then((json) => {
				return ctx.result(json);
			});
		},

		unvote(ctx) {
			ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {
				// Check user is on voters
				if (doc.voters.indexOf(ctx.user.id) == -1) 
					throw ctx.errorBadRequest(C.ERR_NOT_VOTED_YET, ctx.t("app:YouHaveNotVotedThisPostYet"));
				return doc;
			})
			.then((doc) => {
				// Remove user from voters
				return Post.findByIdAndUpdate(doc.id, { $pull: { voters: ctx.user.id } , $inc: { votes: -1 }}, { "new": true });
			})
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "unvoted", json);
				return json;
			})
			.then((json) => {
				return ctx.result(json);
			});

		}

	},

	// Event listeners
	events: {

	},

	// Service methods
	methods: {

	},

	created() {
		// Add custom error types
		C.append([
			"ALREADY_VOTED",
			"NOT_VOTED_YET"
		], "ERR");
		
		// this.logger.info("Service created!");
	},

	started() {
		// this.logger.info("Service started!");
	},

	stopped() {
		// this.logger.info("Service stopped!");
	},

	graphql: {

		query: `
			posts(limit: Int, offset: Int, sort: String): [Post]
			post(code: String): Post
		`,

		types: `
			type Post {
				code: String!
				title: String
				content: String
				author: Person!
				views: Int
				votes: Int,
				voters(limit: Int, offset: Int, sort: String): [Person]
				createdAt: Timestamp
				createdAt: Timestamp
			}
		`,

		mutation: `
			postCreate(title: String!, content: String!): Post
			postUpdate(code: String!, title: String, content: String): Post
			postRemove(code: String!): Post

			postVote(code: String!): Post
			postUnvote(code: String!): Post
		`,

		resolvers: {
			Query: {
				posts: "find",
				post: "get"
			},

			Mutation: {
				postCreate: "create",
				postUpdate: "update",
				postRemove: "remove",
				postVote: "vote",
				postUnvote: "unvote"
			}
		}
	}	
};
