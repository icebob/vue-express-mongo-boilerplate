"use strict";

let logger = require("../../../core/logger");
let config = require("../../../config");
let C = require("../../../core/constants");
let E = require("../../../core/errors");

let _ = require("lodash");

let Post = require("./models/post");

module.exports = {
	name: "posts",
	//version: 1,

	settings: {
		//latestVersion: true,
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		collection: Post,

		hashedIdentity: true,
		modelPropFilter: "code title content author votes voters views createdAt editedAt",

		modelPopulates: {
			"author": "persons.model",
			"voters": "persons.model"
		}
	},

	// Exposed actions
	actions: {
		list: {
			cache: {
				keys: [ "limit", "offset", "sort", "filter", "author" ]
			},
			defaultMethod: "get",
			handler(ctx) {
				let filter = {};

				if (ctx.params.filter == "my")
					filter.author = ctx.user.id;
				else if (ctx.params.author != null)
					filter.author = ctx.params.author;
				//filter.author = this.personService.decodeID(ctx.params.author); // TODO

				let query = this.collection.find(filter);

				return this.applyFilters(query, ctx).exec()
					.then(docs => this.toJSON(docs))
					.then(json => this.populateModels(ctx, json));
			}
		},

		// return a model by ID
		get: {
			cache: {
				keys: [ "code" ]
			},
			permission: C.PERM_PUBLIC,
			defaultMethod: "get",
			needModel: true,
			handler(ctx) {
				return this.Promise.resolve(ctx)
					.then(ctx => this.resolveID(ctx))
					.then(modelID => this.checkModel(modelID, "app:PostNotFound"))
					.then(modelID => this.collection.findByIdAndUpdate(modelID, {
						$inc: {
							views: 1
						}
					}).exec())
					.then(doc => this.toJSON(doc))
					.then(json => this.populateModels(ctx, json));
			}
		},

		model: {
			cache: true,
			publish: false,
			handler(ctx) {
				return this.resolveModel(ctx);
			}
		},

		create: {
			defaultMethod: "post",
			handler(ctx) {
				return this.Promise.resolve(ctx)
					.then(() => {
						let post = new Post({
							title: ctx.params.title,
							content: ctx.params.content,
							author: ctx.params.$user.id
						});
						return post.save();
					})
					.then(doc => this.toJSON(doc))
					.then(json => this.populateModels(ctx, json))
					.then(json => {
						this.notifyModelChanges(ctx, "changed", json, ctx.params.$user);
						
						// Clear cached values
						this.clearCache();
						
						return json;
					});
			}
		},

		update: {
			defaultMethod: "put",
			needModel: true,
			permission: C.PERM_OWNER,
			handler(ctx) {
				return this.Promise.resolve(ctx)
					.then(ctx => this.resolveID(ctx))
					.then(modelID => this.checkModel(modelID, "app:PostNotFound"))
					.then(modelID => this.collection.findById(modelID).exec())
					.then(doc => this.checkModelOwner(doc, "author", ctx.params.$user))
					.then(doc => {
						if (ctx.params.title != null)
							doc.title = ctx.params.title;

						if (ctx.params.content != null)
							doc.content = ctx.params.content;

						doc.editedAt = Date.now();
						return doc.save();
					})
					.then(doc => this.toJSON(doc))
					.then(json => this.populateModels(ctx, json))
					.then((json) => {
						this.notifyModelChanges(ctx, "updated", json, ctx.params.$user);
						
						// Clear cached values
						this.clearCache();

						return json;
					});
			}
		},

		remove: {
			defaultMethod: "delete",
			needModel: true,
			permission: C.PERM_OWNER,
			handler(ctx) {
				return this.Promise.resolve(ctx)
					.then(ctx => ctx.call(this.name + ".model", {
						code: ctx.params.code
					}))
					.then(model => this.checkModel(model, "app:PostNotFound"))
					.then(model => this.checkModelOwner(model, "author", ctx.params.$user))
					.then(model => {
						return this.collection.remove({
							_id: model.id
						}).then(() => model);
					})
					.then((json) => {
						this.notifyModelChanges(ctx, "removed", json, ctx.params.$user);
						
						// Clear cached values
						this.clearCache();

						return json;
					});
			}
		},

		vote(ctx) {
			return this.Promise.resolve(ctx)
				.then(ctx => this.resolveID(ctx))
				.then(modelID => this.checkModel(modelID, "app:PostNotFound"))
				.then(modelID => this.collection.findById(modelID).exec())
				.then(doc => {
					// Check user is on voters
					if (doc.voters.indexOf(ctx.params.$user.id) !== -1)
						throw new E.RequestError(E.BAD_REQUEST, C.ERR_ALREADY_VOTED, "app:YouHaveAlreadyVotedThisPost");
					return doc;
				})
				.then(doc => Post.findByIdAndUpdate(doc.id, {
					$addToSet: {
						voters: ctx.params.$user.id
					},
					$inc: {
						votes: 1
					}
				}, {
					"new": true
				}))
				.then(doc => this.toJSON(doc))
				.then(json => this.populateModels(ctx, json))
				.then(json => {
					this.notifyModelChanges(ctx, "voted", json, ctx.params.$user);
					
					// Clear cached values
					this.clearCache();

					return json;
				});
		},

		unvote(ctx) {
			return this.Promise.resolve(ctx)
				.then(ctx => this.resolveID(ctx))
				.then(modelID => this.checkModel(modelID, "app:PostNotFound"))
				.then(modelID => this.collection.findById(modelID).exec())
				.then(doc => {
					// Check user is on voters
					if (doc.voters.indexOf(ctx.params.$user.id) == -1)
						throw new E.RequestError(E.BAD_REQUEST, C.ERR_NOT_VOTED_YET, "app:YouHaveNotVotedThisPostYet");
					return doc;
				})
				.then(doc => Post.findByIdAndUpdate(doc.id, {
					$pull: {
						voters: ctx.params.$user.id
					},
					$inc: {
						votes: -1
					}
				}, {
					"new": true
				}))
				.then(doc => this.toJSON(doc))
				.then(json => this.populateModels(ctx, json))
				.then(json => {
					this.notifyModelChanges(ctx, "unvoted", json, ctx.params.$user);
					
					// Clear cached values
					this.clearCache();

					return json;
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
				posts: "list",
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


/*
## GraphiQL test ##

# Find all posts
query getPosts {
  posts(sort: "-createdAt -votes", limit: 3) {
    ...postFields
  }
}

# Create a new post
mutation createPost {
  postCreate(title: "New post", content: "New post content") {
    ...postFields
  }
}

# Get a post
query getPost($code: String!) {
  post(code: $code) {
    ...postFields
  }
}

# Update an existing post
mutation updatePost($code: String!) {
  postUpdate(code: $code, content: "Modified post content") {
    ...postFields
  }
}

# vote the post
mutation votePost($code: String!) {
  postVote(code: $code) {
    ...postFields
  }
}

# unvote the post
mutation unVotePost($code: String!) {
  postUnvote(code: $code) {
    ...postFields
  }
}

# Remove a post
mutation removePost($code: String!) {
  postRemove(code: $code) {
    ...postFields
  }
}



fragment postFields on Post {
    code
    title
    content
    author {
      code
      fullName
      username
      avatar
    }
    views
    votes
  	voters {
  	  code
  	  fullName
  	  username
  	  avatar
  	}
}

*/
