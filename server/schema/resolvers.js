"use strict";

let logger 			= require("../core/logger");
let config 			= require("../config");

let _ 				= require("lodash");
let async 			= require("async");
let hashids 		= require("../libs/hashids");
let C 				= require("../core/constants");

let Device 			= require("../applogic/modules/devices/model.device");
let Post 			= require("../applogic/modules/posts/model.post");
let User 			= require("../models/user");

let io 				= require("../core/socket");

let namespace = "/posts";

function applyLimitOffsetSort(query, args) {
	if (args.limit)
		query.limit(args.limit);

	if (args.offset)
		query.skip(args.offset);

	if (args.sort)
		query.sort(args.sort);

	return query;
}

function hasRole(context, role) {
	return context.user.roles.indexOf(role) != -1;
}

module.exports = {

	Timestamp: {
		__parseValue(value) {
			return new Date(value);
		},
		__serialize(value) {
			return value.getTime();
		},
		__parseLiteral(ast) {
			console.log(ast); // ???? when will be called it?
			if (ast.kind === Kind.INT) {
				return parseInt(ast.value, 10);
			}
		}
	},

	Query: {
		devices(root, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			return applyLimitOffsetSort(Device.find({}), args).exec();
		},

		device(root, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			let id = args.id;

			if (args.code)
				id = hashids.decodeHex(args.code);

			if (id)
				return Device.findById(id).exec();

		},

		users(root, args, context) {
			if (!hasRole(context, C.ROLE_ADMIN)) 
				return null;

			return applyLimitOffsetSort(User.find({}), args).exec();
		},

		user(root, args, context) {
			if (!hasRole(context, C.ROLE_ADMIN))
				return null;

			let id = args.id;

			if (args.code)
				id = hashids.decodeHex(args.code);

			if (id)
				return User.findById(id).exec();
		},

		posts(root, args, context) {
			if (!hasRole(context, C.ROLE_USER))  
				return null;

			return applyLimitOffsetSort(Post.find({}), args).exec();
		},

		post(root, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			let id = args.id;

			if (args.code)
				id = hashids.decodeHex(args.code);

			if (id)
				return Post.findById(id).exec();
		}

	},

	User: {
		posts(author, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;
				
			return applyLimitOffsetSort(Post.find({ author: author.id }), args).exec();
		}
	},

	Post: {
		author(post, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			return User.findById(post.author).exec();
		},

		upVoters(post, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			return applyLimitOffsetSort(User.find({ _id: { $in: post.upVoters} }), args).exec();
		},

		downVoters(post, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			return applyLimitOffsetSort(User.find({ _id: { $in: post.downVoters} }), args).exec();
		},

		voters(post, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			return applyLimitOffsetSort(User.find({ _id: { $in: post.upVoters.concat(post.downVoters) } }), args).exec();
		}

	},

	Mutation: {
		upVote(root, args, context) {
			let user = context.user;
			let postID = args.postID;

			if (!hasRole(context, C.ROLE_USER)) 
				return Promise.reject("Must has 'user' role for this function!");

			return new Promise( (resolve, reject) => {
				async.waterfall([

					function getPostById(done) {
						Post.findById(postID, done);
					},

					function checkUserInIsUpVoters(post, done) {
						if (post.upVoters.indexOf(user.id) !== -1) 
							done("You have already voted this post!");
						else
							done(null, post);
					},

					function removeUserFromDownVoters(post, done) {
						if (post.downVoters.indexOf(user.id) !== -1) 
							Post.findByIdAndUpdate(postID, { $pull: { downVoters: user.id }, $inc: { votes: 1 } }, { 'new': true }, done);
						else
							done(null, null);
					},

					function addUserToUpVoters(doc, done) {
						Post.findByIdAndUpdate(postID, { $addToSet: { upVoters: user.id }, $inc: { votes: 1 } }, { 'new': true }, done);
					},

					function populateAuthorOfPost(doc, done) {
						doc.populate("author", "fullName code email gravatar", done);
					}

				], (err, doc) => {
					if (err)
						return reject(err);

					let json = doc.toJSON();

					if (io.namespaces[namespace])
						io.namespaces[namespace].emit("update", json);

					resolve(doc);
				});

			});
		},

		downVote(root, args, context) {
			let user = context.user;
			let postID = args.postID;

			if (!hasRole(context, C.ROLE_USER)) 
				return Promise.reject("Must has 'user' role for this function!");

			return Promise.resolve().then(() => {		
				return Post.findById(postID);
			}).then((post) => {
				// Check user is on downVoters
				if (post.downVoters.indexOf(user.id) !== -1) 
					throw new Error("You have already voted this post!");
				else
					return post;

			}).then((post) => {
				// Remove user from upVoters if it is on the list
				if (post.upVoters.indexOf(user.id) !== -1) 
					return Post.findByIdAndUpdate(post.id, { $pull: { upVoters: user.id }, $inc: { votes: -1 } }, { 'new': true });

			}).then((post) => {
				// Add user to downVoters
				return Post.findByIdAndUpdate(post.id, { $addToSet: { downVoters: user.id } , $inc: { votes: -1 }}, { 'new': true });

			}).then((doc) => {
				// Populate author
				return Post.populate(doc, { path: 'author', select: 'fullName code email gravatar'});

			}).then((doc) => {
				// Send back the response
				let json = doc.toJSON();

				if (io.namespaces[namespace])
					io.namespaces[namespace].emit("update", json);

				return doc;

			});

		}
	}
};