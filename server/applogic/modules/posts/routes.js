"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let express			= require("express");
let async 			= require("async");

let auth			= require("../../../core/auth/helper");
let response		= require("../../../core/response");
let Post 			= require("./model.post");
let hashids			= require("../../../libs/hashids");

let io 				= require("../../../core/socket");

let namespace = "/posts";

module.exports = function(app, db) {

	let router = express.Router();

	// Must be authenticated
	router.use(auth.isAuthenticatedOrApiKey);

	// Must be user role
	router.use(auth.hasRole("user"));

	/**
	 * Upvote a post
	 */
	router.get("/upvote/:postID", (req, res) => {

		async.waterfall([

			function checkUserInIsUpVoters(done) {
				if (req.post.upVoters.indexOf(req.user.id) !== -1) 
					done("You have already voted this post!");
				else
					done();
			},

			function removeUserFromDownVoters(done) {
				if (req.post.downVoters.indexOf(req.user.id) !== -1) 
					Post.findByIdAndUpdate(req.post.id, { $pull: { downVoters: req.user.id } }, { 'new': true }, done);
				else
					done();
			},

			function addUserToUpVoters(doc, done) {
				Post.findByIdAndUpdate(req.post.id, { $addToSet: { upVoters: req.user.id } }, { 'new': true }, done);
			},

			function populateAuthorOfPost(doc, done) {
				doc.populate("author", "fullName code email gravatar", done);
			}

		], (err, doc) => {
			if (err)
				return response.json(res, null, response.BAD_REQUEST, err);

			let json = doc.toJSON();

			if (io.namespaces[namespace])
				io.namespaces[namespace].emit("update", json);

			return response.json(res, json);
		});

	});

	/**
	 * Downvote a post
	 */
	router.get("/downvote/:postID", (req, res) => {
		Promise.resolve().then(() => {		
			// Check user is on downVoters
			if (req.post.downVoters.indexOf(req.user.id) !== -1) 
				throw new Error("You have already voted this post!");

		}).then(() => {
			// Remove user from upVoters if it is in the list
			if (req.post.upVoters.indexOf(req.user.id) !== -1) 
				return Post.findByIdAndUpdate(req.post.id, { $pull: { upVoters: req.user.id } }, { 'new': true });

		}).then(() => {
			// Add user to downVoters
			return Post.findByIdAndUpdate(req.post.id, { $addToSet: { downVoters: req.user.id } }, { 'new': true });

		}).then((doc) => {
			// Populate author
			return Post.populate(doc, { path: 'author', select: 'fullName code email gravatar'});

		}).then((doc) => {
			// Send back the response
			let json = doc.toJSON();

			if (io.namespaces[namespace])
				io.namespaces[namespace].emit("update", json);

			response.json(res, json);

		}).catch((err)=> {
			// Send error response
			response.json(res, null, response.BAD_REQUEST, err.message);
		});

	});	

	/**
	 * Get all posts
	 */
	router.get("/:viewMode/:sort", (req, res) => {

		let filter = {};

		if (req.params.viewMode == "my") 
			filter.author = req.user.id;

		let query = Post.find(filter);

		switch(req.params.sort) {
			case "hot": query.sort({ votes: -1 }); break;
			case "mostviewed": query.sort({ views: -1 }); break;
			default: query.sort({ createdAt: -1 });
		}

		if (req.query.limit)
			query.limit(req.query.limit || 20);
	
		query.populate("author", "fullName code email gravatar");

		query.exec((err, docs) => {
			if (!docs || docs.length == 0) return response.json(res, []);

			let items = docs.map((item) => item.toJSON());
			return response.json(res, items);
		});
	});

	router.post("/", (req, res) => {

		req.assert("title", "Post title cannot be blank!").notEmpty();
		req.assert("content", "Post content cannot be blank!").notEmpty();

		let errors = req.validationErrors();
		if (errors)
			return response.json(res, null, response.BAD_REQUEST, errors);
	

		let post = new Post({
			title: req.body.title,
			content: req.body.content,
			author: req.user.id
		});

		post.save((err) => {
			if (err)
				return response.json(res, null, response.SERVER_ERROR, err);

			post.populate("author", "fullName code email gravatar", (err) => {

				let json = post.toJSON();

				if (io.namespaces[namespace])
					io.namespaces[namespace].emit("new", json);

				return response.json(res, json);
			});
		});
	});

	/**
	 * Resolve the postID URL parameter. First decode the hashed ID 
	 * and search post by ID in database
	 */
	router.param("postID", function(req, res, next, postID) {
		let id = hashids.decodeHex(postID);
		if (id == null || id == "")
			return response.json(res, null, response.BAD_REQUEST, "Invalid Post ID!");

		Post.findById(id, (err, doc) => {
			if (err)
				return response.json(res, null, response.BAD_REQUEST, err);
			
			if (!doc) 
				return response.json(res, null, response.NOT_FOUND, "Post not found!");

			doc.populate("author", "fullName code email gravatar", (err) => {

				req.post = doc;
				next();

			});
		});
	});

	/**
	 * Handle postID specific routes
	 */
	router.route("/:postID")

		// Call every request method
		.all((req, res, next) => {

			next();
		})

		/**
		 * Get a post
		 */
		.get((req, res) => {
			// Increment view counter
			Post.findByIdAndUpdate(req.post.id, { $inc: { views: 1 } }).exec();

			return response.json(res, req.post.toJSON());
		})

		/**
		 * Modify a post
		 */
		.put((req, res) => {
			req.assert("title", "Post title cannot be blank!").notEmpty();
			req.assert("content", "Post content cannot be blank!").notEmpty();

			let errors = req.validationErrors();
			if (errors)
				return response.json(res, null, response.BAD_REQUEST, errors);

			if (req.post.author.id != req.user.id) {
				return response.json(res, null, response.BAD_REQUEST, "Only the author can edit this post!");
			}

			req.post.title = req.body.title;
			req.post.content = req.body.content;

			req.post.save((err) => {
				if (err)
					return response.json(res, null, response.BAD_REQUEST, err);

				let json = req.post.toJSON();

				if (io.namespaces[namespace])
					io.namespaces[namespace].emit("update", json);

				return response.json(res, json);
			});
		})

		/**
		 * Delete a post
		 */
		.delete((req, res) => {

			if (req.post.author.id != req.user.id) {
				return response.json(res, null, response.BAD_REQUEST, "Only the author can delete this post!");
			}

			Post.remove({ _id: req.post.id }, (err) => {
				if (err)
					return response.json(res, null, response.BAD_REQUEST, err);

				if (io.namespaces[namespace])
					io.namespaces[namespace].emit("remove", req.post.toJSON());

				return response.json(res);
			});

		});


	// API versioning
	app.use("/v1/posts", router);

	// v1 is the default route
	app.use("/posts", router);
};