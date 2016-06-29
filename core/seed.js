"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let _ 				= require("lodash");

let tokgen 			= require("../libs/tokgen");

let User 			= require("../models/user");
let Device 			= require("../applogic/modules/devices/model.device");

let fakerator		= require("fakerator")();

module.exports = function() {
	User.find({}).exec(function(err, docs) {
		let admin, test;
		if (docs.length === 0) {
			logger.warn("Load default Users to DB...");

			let admin = new User({
				fullName: "Administrator",
				email: "admin@boilerplate-app.com",
				username: "admin",
				password: "admin1234",
				provider: "local",
				roles: ["admin", "user"],
				verified: true
			});

			admin.save(function(err) {
				if (err) 
					return logger.warn("Unable to create default admin user!");

				let test = new User({
					fullName: "Test User",
					email: "test@boilerplate-app.com",
					username: "test",
					password: "test1234",
					provider: "local",
					roles: ["user"],
					verified: true,
					apiKey: tokgen()
				});
				
				test.save(function() {
					if (err) 
						return logger.warn("Unable to create default admin user!");
					
					logger.info("Default users created!");
				});

			});
		}
	});

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

};
