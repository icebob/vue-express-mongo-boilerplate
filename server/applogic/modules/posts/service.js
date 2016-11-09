"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let Post 			= require("./models/post");
let User 			= require("../users/models/user");

module.exports = {
	name: "posts",
	version: 1,
	namespace: "posts",
	rest: true,
	ws: true,
	graphql: true,
	role: "user",
	model: Post,
	idParamName: "code", // GET /posts/find?code=123
	
	populateAuthorFields: "username fullName code email gravatar",

	actions: {
		find(ctx) {
			let filter = {};

			if (ctx.params.viewMode == "my") 
				filter.author = ctx.user.id;

			let query = Post.find(filter);

			query.populate("author", this.populateAuthorFields);

			return ctx.queryPageSort(query).exec().then( (docs) => {
				return ctx.toJSON(docs);
			});
		},

		// return a model by ID
		get(ctx) {
			if (!ctx.model)
				throw ctx.errorBadRequest(ctx.t("PostNotFound"));

			return Post.findByIdAndUpdate(ctx.model.id, { $inc: { views: 1 } }).exec().then( (doc) => {
				return ctx.toJSON(doc);
			});
		},

		save: {
			roles: "admin",
			handler(ctx) {

				ctx.validateParam("title").trim().notEmpty(ctx.t("PostTitleCannotBeEmpty")).end();
				ctx.validateParam("content").trim().notEmpty(ctx.t("PostContentCannotBeEmpty")).end();
				if (ctx.hasValidationErrors())
					throw ctx.errorBadRequest(ctx.validationErrors);
			

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

		update(ctx) {
			if (!ctx.model)
				throw ctx.errorBadRequest(ctx.t("PostNotFound"));

			ctx.validateParam("title").trim().notEmpty(ctx.t("PostTitleCannotBeEmpty")).end();
			ctx.validateParam("content").trim().notEmpty(ctx.t("PostContentCannotBeEmpty")).end();
			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(ctx.validationErrors);

			if (ctx.model.author.id != ctx.user.id) {
				return ctx.errorBadRequest(ctx.t("OnlyAuthorEditPost"));
			}

			ctx.model.title = ctx.params.title;
			ctx.model.content = ctx.params.content;

			return ctx.model.save()
				.then((doc) => {
					return ctx.toJSON(doc);
				})
				.then((json) => {

					this.notifyModelChanges(ctx, "updated", json);

					return json;
				});								

		},

		remove(ctx) {
			if (!ctx.model)
				throw ctx.errorBadRequest(ctx.t("PostNotFound"));

			if (ctx.model.author.id != ctx.user.id) {
				return ctx.errorBadRequest(ctx.t("OnlyAuthorDeletePost"));
			}

			return Post.remove({ _id: ctx.model.id })
				.then(() => {
					return ctx.toJSON();
				})
				.then((json) => {

					this.notifyModelChanges(ctx, "removed", json);

					return json;
				});		
		},

		upVote(ctx) {
			if (!ctx.model)
				return Promise.reject(new Error(ctx.t("PostNotFound")));

			return Promise.resolve().then(() => {		
				// Check user is on upVoters
				if (ctx.model.upVoters.indexOf(ctx.user.id) !== -1) 
					throw ctx.errorBadRequest(ctx.t("YouHaveAlreadyVotedThisPost"));

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
				return Promise.reject(new Error(ctx.t("PostNotFound")));

			return Promise.resolve().then(() => {		
				// Check user is on downVoters
				if (ctx.model.downVoters.indexOf(ctx.user.id) !== -1) 
					throw ctx.errorBadRequest(ctx.t("YouHaveAlreadyVotedThisPost"));

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

	// resolve model by ID		
	modelResolver(ctx, code) {
		let id = Post.schema.methods.decodeID(code);
		if (id == null || id == "")
			return Promise.reject(new Error(ctx.t("InvalidPostID")));

		return Post.findById(id).exec().then( (doc) => {
			if (!doc) 
				return Promise.reject(new Error(ctx.t("PostNotFound")));

			return Post.populate(doc, { path: "author", select: this.populateAuthorFields});
		});		
		
	},

	notifyModelChanges(ctx, type, json) {
		ctx.emit(type, json);
		logger.debug(json);
	},

	init(ctx) {
		// Fired when start the service
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
				id: Int!
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
			postSave(title: String!, content: String!): Post
			postUpdate(code: String!, title: String!, content: String!): Post
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
					return ctx.queryPageSort(User.find({ _id: { $in: post.upVoters} })).exec();
				},

				downVoters(post, args, context) {
					return ctx.queryPageSort(User.find({ _id: { $in: post.downVoters} })).exec();
				},

				voters(post, args, context) {
					return ctx.queryPageSort(User.find({ _id: { $in: post.upVoters.concat(post.downVoters) } })).exec();
				}

			},

			Mutation: {
				postSave: "save",
				postUpdate: "update",
				postRemove: "remove",
				postUpVote: "upVote",
				postDownVote: "downVote",
			}
		}
	}

};