"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let Post 			= require("./models/post");

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
	
	actions: {
		find(ctx) {
			let filter = {};

			if (ctx.params.viewMode == "my") 
				filter.author = ctx.user.id;

			let query = Post.find(filter);

			switch(ctx.params.sort) {
			case "hot": query.sort({ votes: -1 }); break;
			case "mostviewed": query.sort({ views: -1 }); break;
			default: query.sort({ createdAt: -1 });
			}

			if (ctx.params.limit)
				query.limit(ctx.params.limit || 20);
		
			query.populate("author", "username fullName code email gravatar");

			return query.exec().then( (docs) => {
				if (!docs || docs.length == 0) return [];

				return docs.map((item) => item.toJSON());
			});
		},

		// return a model by ID
		get(ctx) {
			if (!ctx.model)
				throw ctx.errorBadRequest(ctx.t("PostNotFound"));

			let foo = ctx.validateParam("foo").trim().notEmpty("Ez üres!!!!").end();
			logger.info(foo);

			return Post.findByIdAndUpdate(ctx.model.id, { $inc: { views: 1 } }).exec().then( (doc) => {
				return ctx.model.toJSON();
			});
		},

		save: {
			roles: "admin",
			handler(ctx) {

			}
		},

		update(ctx) {
			if (!ctx.model)
				throw ctx.errorBadRequest(ctx.t("PostNotFound"));

		},

		remove(ctx) {
			if (!ctx.model)
				throw ctx.errorBadRequest(ctx.t("PostNotFound"));

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
					return Post.findByIdAndUpdate(ctx.model.id, { $pull: { downVoters: ctx.user.id }, $inc: { votes: -1 } }, { "new": true });

			}).then(() => {
				// Add user to upVoters
				return Post.findByIdAndUpdate(ctx.model.id, { $addToSet: { upVoters: ctx.user.id } , $inc: { votes: -1 }}, { "new": true });

			}).then((doc) => {
				// Populate author
				return Post.populate(doc, { path: "author", select: "username fullName code email gravatar"});

			}).then((doc) => {
				// Send back the response
				let json = doc.toJSON();

				//if (io.namespaces[moduleConfig.namespace])
				//	io.namespaces[moduleConfig.namespace].emit("update", json);

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
				return Post.populate(doc, { path: "author", select: "username fullName code email gravatar"});

			}).then((doc) => {
				// Send back the response
				let json = doc.toJSON();

				//if (io.namespaces[moduleConfig.namespace])
				//	io.namespaces[moduleConfig.namespace].emit("update", json);

				return json;
			});

		}

	},

	// resolve model by ID		
	modelResolver(ctx, code) {
		let id = Post.schema.methods.decodeID(code);
		if (id == null || id == "")
			return new Error(ctx.t("InvalidPostID"));

		return Post.findById(id).exec().then( (doc) => {
			if (!doc) 
				return null;

			return doc.populate("author", "username fullName code email gravatar");
		});		
		
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
		query: ``,
		types: ``,
		mutation: ``,
		resolvers: {
			Query: {

			},

			Mutation: {

			}
		}
	}

};