"use strict";

let logger 			= require("../core/logger");
let config 			= require("../config");

let _ 				= require("lodash");
let hashids 		= require("../libs/hashids");

let Device 			= require("../applogic/modules/devices/model.device");
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
		}
		/*,

		post(root, args, context) {
			// Require 'admin' role
			if (context.user.roles.indexOf("admin") !== -1)
				return _.find(posts, (post) => post.id == args.id);
		}*/
	}/*,

	Device: {
		lastCommunication(device) {
			return new Date(device.lastCommunication).valueOf();
		}
	},

	User: {
		lastLogin(device) {
			return new Date(device.lastLogin).valueOf();
		}
	}*/
	/*,

	Author: {
		posts(author, args, context) {
			// Require 'admin' role
			if (context.user.roles.indexOf("admin") !== -1)
				return author.posts;
		}
	},

	Post: {
		author(post, args, context) {
			return post.author;
		},
		views(post, args, context) {
			return fakerator.random.number(200);
		}
	}*/
};