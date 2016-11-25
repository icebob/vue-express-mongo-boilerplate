"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Post 		= require("./models/post");

module.exports = {
	settings: {
		name: "posts",
		version: 1,
		namespace: "posts",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Post,

		modelPropFilter: "code title content author votes downVoters upVoters views createdAt updatedAt",
		
		modelPopulates: {
			"author": "users",
			"upVoters": "users",
			"downVoters": "users"
		}
	},

	actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {};

				if (ctx.params.filter == "my") 
					filter.author = ctx.user.id;

				let query = Post.find(filter);

				//query.populate("author", this.$settings.populateAuthorFields);

				return ctx.queryPageSort(query).exec().then( (docs) => {
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
			permission: C.PERM_PUBLIC,
			handler(ctx) {
				if (!ctx.model)
					throw ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:PostNotFound"));

				return Post.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } }).exec().then( (doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				});
			}
		},

		create: {
			//permission: C.PERM_ADMIN,
			handler(ctx) {

				this.validateParams(ctx, true);

				let post = new Post({
					title: ctx.params.title,
					content: ctx.params.content,
					author: ctx.user.id
				});

				return post.save()
				.then((doc) => {
					return Post.populate(doc, { path: "author", select: this.$settings.populateAuthorFields});
				})
				.then((doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "created", json);
					return json;
				});								
			}
		},

		update: {
			permission: C.PERM_OWNER,
			handler(ctx) {
				if (!ctx.model)
					throw ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:PostNotFound"));

				this.validateParams(ctx);

				return this.collection.findById(ctx.modelID).exec()
				.then((doc) => {
					if (ctx.params.title != null)
						doc.title = ctx.params.title;

					if (ctx.params.content != null)
						doc.content = ctx.params.content;

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
				});								
			}
		},

		remove: {
			permission: C.PERM_OWNER,
			handler(ctx) {
				if (!ctx.model)
					throw ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:PostNotFound"));

				return Post.remove({ _id: ctx.modelID })
				.then(() => {
					return ctx.model;
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "removed", json);
					return json;
				});		
			}
		},

		upVote(ctx) {
			if (!ctx.model)
				return Promise.reject(new Error(ctx.t("app:PostNotFound")));

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {		
				// Check user is on upVoters
				if (doc.upVoters.indexOf(ctx.user.id) !== -1) 
					throw ctx.errorBadRequest(C.ERR_ALREADY_VOTED, ctx.t("app:YouHaveAlreadyVotedThisPost"));
				return doc;
			})
			.then((doc) => {
				// Remove user from downVoters if it is on the list
				if (doc.downVoters.indexOf(ctx.user.id) !== -1) 
					return Post.findByIdAndUpdate(doc.id, { $pull: { downVoters: ctx.user.id }, $inc: { votes: 1 } }, { "new": true });
				return doc;
			})
			.then((doc) => {
				// Add user to upVoters
				return Post.findByIdAndUpdate(doc.id, { $addToSet: { upVoters: ctx.user.id } , $inc: { votes: 1 }}, { "new": true });
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
			});
		},

		downVote(ctx) {
			if (!ctx.model)
				return Promise.reject(new Error(ctx.t("app:PostNotFound")));

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {
				// Check user is on downVoters
				if (doc.downVoters.indexOf(ctx.user.id) !== -1) 
					throw ctx.errorBadRequest(C.ERR_ALREADY_VOTED, ctx.t("app:YouHaveAlreadyVotedThisPost"));
				return doc;
			})
			.then((doc) => {
				// Remove user from upVoters if it is on the list
				if (doc.upVoters.indexOf(ctx.user.id) !== -1) 
					return Post.findByIdAndUpdate(doc.id, { $pull: { upVoters: ctx.user.id }, $inc: { votes: -1 } }, { "new": true });
				return doc;
			})
			.then((doc) => {
				// Add user to downVoters
				return Post.findByIdAndUpdate(doc.id, { $addToSet: { downVoters: ctx.user.id } , $inc: { votes: -1 }}, { "new": true });
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
			});

		}

	},

	methods: {
		/**
		 * Validate params of context.
		 * We will call it in `create` and `update` actions
		 * 
		 * @param {Context} ctx 			context of request
		 * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
		 */
		validateParams(ctx, strictMode) {
			if (strictMode || ctx.hasParam("title"))
				ctx.validateParam("title").trim().notEmpty(ctx.t("app:PostTitleCannotBeEmpty")).end();

			if (strictMode || ctx.hasParam("content"))
				ctx.validateParam("content").trim().notEmpty(ctx.t("app:PostContentCannotBeEmpty")).end();
			
			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}

	},

	/**
	 * Resolve model by `code` param
	 * 
	 * @param {any} ctx		Context of request
	 * @param {any} code	Code of the model
	 * @returns	{Promise}
	 */	/*
	modelResolver(ctx, code) {
		let id = Post.schema.methods.decodeID(code);
		if (id == null || id == "")
			return ctx.errorBadRequest(C.ERR_INVALID_CODE, ctx.t("app:InvalidCode"));

		return Post.findById(id).exec().then( (doc) => {
			if (!doc) 
				return ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:PostNotFound"));

			return Post.populate(doc, { path: "author", select: this.$settings.populateAuthorFields});
		});

		return this.getByID(id);
	},*/

	/**
	 * Check the owner of model
	 * 
	 * @param {any} ctx	Context of request
	 * @returns	{Promise}
	 */
	ownerChecker(ctx) {
		return new Promise((resolve, reject) => {
			if (!ctx.model)
				ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("PostNotFound"));

			if (ctx.model.author.id == ctx.user.id || ctx.hasRole(C.ROLE_ADMIN)) 
				resolve();
			else
				reject();
		});
	},

	init(ctx) {
		// Fired when start the service
		this.userService = ctx.services("users");
 
		// Add custom error types
		C.append([
			"ALREADY_VOTED"
		], "ERR");
	},

	socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
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
				author: User!
				views: Int
				upVoters(limit: Int, offset: Int, sort: String): [User]
				downVoters(limit: Int, offset: Int, sort: String): [User]
				votes: Int,
				createdAt: Timestamp
				updatedAt: Timestamp
			}
		`,

		mutation: `
			postCreate(title: String!, content: String!): Post
			postUpdate(code: String!, title: String, content: String): Post
			postRemove(code: String!): Post

			postUpVote(code: String!): Post
			postDownVote(code: String!): Post
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
				postUpVote: "upVote",
				postDownVote: "downVote",
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

# upVote to the post
mutation upVotePost($code: String!) {
  postUpVote(code: $code) {
    ...postFields
  }
}

# upVote to the post
mutation downVotePost($code: String!) {
  postDownVote(code: $code) {
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
  	upVoters {
  	  code
  	  fullName
  	  username
  	  avatar
  	}
  	downVoters {
  	  code
  	  fullName
  	  username
  	  avatar
  	}
}

*/