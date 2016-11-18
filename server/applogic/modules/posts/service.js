"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let Post 		= require("./models/post");
let User 		= require("../users/models/user");

module.exports = {
	name: "posts",
	version: 1,
	namespace: "posts",
	rest: true,
	ws: true,
	permission: C.PERM_LOGGEDIN,
	model: Post,
	idParamName: "code", // GET /posts/find?code=123

	modelPropFilter: "code title content author votes downVoters upVoters views createdAt updatedAt",
	
	populateAuthorFields: "username fullName code email avatar",

	actions: {
		find(ctx) {
			let filter = {};

			if (ctx.params.filter == "my") 
				filter.author = ctx.user.id;

			let query = Post.find(filter);

			query.populate("author", this.populateAuthorFields);

			return ctx.queryPageSort(query).exec().then( (docs) => {
				return ctx.toJSON(docs);
			});
		},

		// return a model by ID
		get: {
			permission: C.PERM_PUBLIC,
			handler(ctx) {
				if (!ctx.model)
					throw ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:PostNotFound"));

				return Post.findByIdAndUpdate(ctx.model.id, { $inc: { views: 1 } }).exec().then( (doc) => {
					return ctx.toJSON(doc);
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
						return Post.populate(doc, { path: "author", select: this.populateAuthorFields});
					})
					.then((doc) => {
						return ctx.toJSON(doc);
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

				if (ctx.model.author.id != ctx.user.id) {
					return ctx.errorBadRequest(C.ERR_ONLY_OWNER_CAN_EDIT_AND_DELETE, ctx.t("app:OnlyAuthorEditPost"));
				}

				if (ctx.params.title != null)
					ctx.model.title = ctx.params.title;

				if (ctx.params.content != null)
					ctx.model.content = ctx.params.content;

				return ctx.model.save()
					.then((doc) => {
						return ctx.toJSON(doc);
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

				if (ctx.model.author.id != ctx.user.id) {
					return ctx.errorBadRequest(C.ERR_ONLY_OWNER_CAN_EDIT_AND_DELETE, ctx.t("app:OnlyAuthorDeletePost"));
				}

				return Post.remove({ _id: ctx.model.id })
					.then(() => {
						return ctx.toJSON();
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

			return Promise.resolve().then(() => {		
				// Check user is on upVoters
				if (ctx.model.upVoters.indexOf(ctx.user.id) !== -1) 
					throw ctx.errorBadRequest(C.ERR_ALREADY_VOTED, ctx.t("app:YouHaveAlreadyVotedThisPost"));

			}).then(() => {
				// Remove user from downVoters if it is on the list
				if (ctx.model.downVoters.indexOf(ctx.user.id) !== -1) 
					return Post.findByIdAndUpdate(ctx.model.id, { $pull: { downVoters: ctx.user.id }, $inc: { votes: 1 } }, { "new": true });

			}).then(() => {
				// Add user to upVoters
				return Post.findByIdAndUpdate(ctx.model.id, { $addToSet: { upVoters: ctx.user.id } , $inc: { votes: 1 }}, { "new": true });

			}).then((doc) => {
				// Populate author
				return Post.populate(doc, { path: "author", select: this.populateAuthorFields});

			}).then((doc) => {
				// Send back the response
				let json = ctx.toJSON(doc);

				this.notifyModelChanges(ctx, "updated", json);

				return json;
			});
		},

		downVote(ctx) {
			if (!ctx.model)
				return Promise.reject(new Error(ctx.t("app:PostNotFound")));

			return Promise.resolve().then(() => {		
				// Check user is on downVoters
				if (ctx.model.downVoters.indexOf(ctx.user.id) !== -1) 
					throw ctx.errorBadRequest(C.ERR_ALREADY_VOTED, ctx.t("app:YouHaveAlreadyVotedThisPost"));

			}).then(() => {
				// Remove user from upVoters if it is on the list
				if (ctx.model.upVoters.indexOf(ctx.user.id) !== -1) 
					return Post.findByIdAndUpdate(ctx.model.id, { $pull: { upVoters: ctx.user.id }, $inc: { votes: -1 } }, { "new": true });

			}).then(() => {
				// Add user to downVoters
				return Post.findByIdAndUpdate(ctx.model.id, { $addToSet: { downVoters: ctx.user.id } , $inc: { votes: -1 }}, { "new": true });

			}).then((doc) => {
				// Populate author
				return Post.populate(doc, { path: "author", select: this.populateAuthorFields});

			}).then((doc) => {
				// Send back the response
				let json = ctx.toJSON(doc);

				this.notifyModelChanges(ctx, "updated", json);

				return json;
			});

		}

	},

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
	},	

	// resolve model by ID		
	modelResolver(ctx, code) {
		let id = Post.schema.methods.decodeID(code);
		if (id == null || id == "")
			return ctx.errorBadRequest(C.ERR_INVALID_CODE, ctx.t("app:InvalidCode"));

		return Post.findById(id).exec().then( (doc) => {
			if (!doc) 
				return ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:DeviceNotFound"));

			return Post.populate(doc, { path: "author", select: this.populateAuthorFields});
		});		
		
	},

	// Check the owner of model
	ownerChecker(ctx) {
		return new Promise((resolve, reject) => {
			if (!ctx.model)
				ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("PostNotFound"));

			if (ctx.model.author.id == ctx.user.id) 
				resolve();
			else
				reject();
		});
	},

	notifyModelChanges(ctx, type, json) {
		ctx.notifyChanges(type, json, "user");
	},

	init(ctx) {
		// Fired when start the service
 
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
				voters(limit: Int, offset: Int, sort: String): [User]
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

			Post: {
				author(post, args, context) {
					return User.findById(post.author).exec();
				},

				upVoters(post, args, context) {
					return context.ctx.queryPageSort(User.find({ _id: { $in: post.upVoters} })).exec();
				},

				downVoters(post, args, context) {
					return context.ctx.queryPageSort(User.find({ _id: { $in: post.downVoters} })).exec();
				},

				voters(post, args, context) {
					return context.ctx.queryPageSort(User.find({ _id: { $in: post.upVoters.concat(post.downVoters) } })).exec();
				}

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
  	voters {
  	  code
  	  fullName
  	  username
  	  avatar
  	}
}

*/