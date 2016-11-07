"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

module.exports = {
	name: "posts",
	version: 1,
	namespace: "posts",
	rest: true,
	ws: true,
	graphql: true,
	role: "user",
	
	actions: {
		find(ctx) {
			// return all models
			return Promise.resolve();
		},

		get(ctx) {
			// return a model by ID
			return ctx.model;
		},

		save: {
			roles: "admin",
			handler(ctx) {

			}
		},

		update(ctx) {

		},

		remove(ctx) {

		},

		upVote(ctx) {
			store.counter++;
			logger.info(socket.request.user.username + " increment the counter to ", store.counter);
			ctx.actions.notifyChanged();
		},

		downVote(ctx) {
			throw ctx.ErrorBadRequest(ctx.t("YouHaveAlreadyVotedThisPost"))
		}

	},

	modelResolvers(id) {
		// return model by ID
		/*
		let id = Post.schema.methods.decodeID(postID);
		if (id == null || id == "")
			return response.json(res, null, response.BAD_REQUEST, req.t("InvalidPostID"));

		Post.findById(id, (err, doc) => {
			if (err)
				return response.json(res, null, response.BAD_REQUEST, err);
			
			if (!doc) 
				return response.json(res, null, response.NOT_FOUND, req.t("PostNotFound"));

			doc.populate("author", "fullName code email gravatar", (err) => {

				req.post = doc;
				next();

			});
		});
		
		 */
	},

	init(ctx) {
		// Call when start the service
	},

	socket: {
		afterConnection(socket, io) {
			
		}
	},

	graphql: {
		query: ``,
		types: ``,
		mutation: ``,
		resolvers: {
			// Generated from actions
		}
	}

};