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
	let devices = Device.find({}).exec().then((docs) => {
		if (docs.length === 0) {
			logger.warn("Load default Devices to DB...");

			_.times(36, () => {

				let device = new Device({
					address: fakerator.internet.ip(),
					type: fakerator.random.arrayElement(["rasperry", "odroid", "nanopi", "pc"]),
					name: fakerator.populate("#{names.firstName}'s device"),
					description: fakerator.lorem.sentence(),
					status: fakerator.random.boolean("80") ? 1 : 0,
					lastCommunication: Date.now()
				});

				return device.save().then(() => {
					logger.info("Default devices created!");
				});
			});
		}
	});

	let posts = Post.find({}).exec(function(err, docs) {
		if (docs.length === 0) {
			logger.warn("Load default Posts to DB...");

			User.find({}).lean().select("_id").exec((err, users) => {
				if (users && users.length > 0) {
					_.times(60, () => {

						let fakePost = fakerator.entity.post(fakerator.random.number(2,1));

						let post = new Post({
							title: fakePost.title,
							content: fakePost.content,
							author: fakerator.random.arrayElement(users)._id
						});

						return post.save().then(() => {
							logger.info("Default posts created!");
						});

						// TODO make voters
					});
				}

			});

		}
	});

	return Promise.all([devices, posts]);
};
