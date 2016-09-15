"use strict";

// let ROOT 			= "../../";
let logger 			= require("../../core/logger");
let config 			= require("../../config");

let _ 				= require("lodash");
let tokgen 			= require("../../libs/tokgen");
let fakerator		= require("fakerator")();

let User 			= require("../.././models/user");
let Device 			= require("../modules/devices/models/device");
let Post 			= require("../modules/posts/models/post");

module.exports = function() {
	Device.find({}).exec(function(err, docs) {
		if (docs.length === 0) {
			logger.warn("Load default Devices to DB...");

			_.times(5, () => {

				let device = new Device({
					address: fakerator.internet.ip(),
					type: fakerator.random.arrayElement(["rasperry", "odroid", "nanopi", "pc"]),
					name: fakerator.populate("#{names.firstName}'s device"),
					description: fakerator.lorem.sentence(),
					status: fakerator.random.boolean("80") ? 1 : 0,
					lastCommunication: Date.now()
				});

				device.save(function(err) {
					if (err) 
						return logger.warn("Unable to create default devices!", err);
				});
			});
		}
	});

	Post.find({}).exec(function(err, docs) {
		if (docs.length === 0) {
			logger.warn("Load default Posts to DB...");

			User.find({}).lean().select("_id").exec((err, users) => {

				_.times(10, () => {

					let fakePost = fakerator.entity.post();

					let post = new Post({
						title: fakePost.title,
						content: fakePost.content,
						author: fakerator.random.arrayElement(users)._id
					});

					post.save(function(err) {
						if (err) 
							return logger.warn("Unable to create default posts!", err);
					});
				});

			});

		}
	});

};
