"use strict";

let logger 			= require("../core/logger");
let config 			= require("../config");

let _ 				= require("lodash");
let hashids 		= require("../libs/hashids");

let Device 			= require("../applogic/modules/devices/model.device");
let Post 			= require("../applogic/modules/posts/model.post");
let User 			= require("../models/user");


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
			// Require 'user' role
			if (context.user.roles.indexOf("user") == -1) 
				return null;

			return Device.find({}).exec();
		},

		device(root, args, context) {
			// Require 'user' role
			if (context.user.roles.indexOf("user") == -1)
				return null;

			let id = args.id;

			if (args.code)
				id = hashids.decodeHex(args.code);

			if (id)
				return Device.findById(id).exec();

		},

		users(root, args, context) {
			// Require 'user' role
			if (context.user.roles.indexOf("admin") == -1) 
				return null;

			return User.find({}).exec();
		},

		user(root, args, context) {
			// Require 'user' role
			if (context.user.roles.indexOf("admin") == -1)
				return null;

			let id = args.id;

			if (args.code)
				id = hashids.decodeHex(args.code);

			if (id)
				return User.findById(id).exec();
		},

		posts(root, args, context) {
			if (context.user.roles.indexOf("user") == -1) 
				return null;

			return Post.find({}).exec();
		},

		post(root, args, context) {
			// Require 'user' role
			if (context.user.roles.indexOf("user") == -1)
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
			// Require 'user' role
			if (context.user.roles.indexOf("user") == -1)
				return null;
				
			return Post.find({ author: author.id }).exec();
		}
	},

	Post: {
		author(post, args, context) {
			// Require 'user' role
			if (context.user.roles.indexOf("user") == -1)
				return null;

			return User.findById(post.author).exec();
		},

		upVoters(post, args, context) {
			// Require 'user' role
			if (context.user.roles.indexOf("user") == -1)
				return null;

			console.log(post.upVoters);
			return User.find({ _id: { $in: post.upVoters} }).exec();
		},

		downVoters(post, args, context) {
			// Require 'user' role
			if (context.user.roles.indexOf("user") == -1)
				return null;

			console.log(post.downVoters);
			return User.find({ _id: { $in: post.downVoters} }).exec();
		}		
	}
};