"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let _ 				= require("lodash");
let tokgen 			= require("../libs/tokgen");
let fakerator		= require("fakerator")();

let User 			= require("../models/user");

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

	require("../applogic/libs/seed-db")();
};
