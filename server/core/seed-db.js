"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let _ 				= require("lodash");
let tokgen 			= require("../libs/tokgen");
let fakerator		= require("fakerator")();

let User 			= require("../models/user");

module.exports = function() {
	/**
	 * Create default `admin` and `test` users
	 */
	return User.find({}).exec().then((docs) => {
		if (docs.length === 0) {
			logger.warn("Load default Users to DB...");

			let users = [];

			let admin = new User({
				fullName: "Administrator",
				email: "admin@boilerplate-app.com",
				username: "admin",
				password: "admin1234",
				provider: "local",
				roles: ["admin", "user"],
				verified: true
			});
			users.push(admin.save());

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
			
			users.push(test.save());

			return Promise.all(users).then(() => {
				logger.warn("Default users created!");
			});
		}
	}).catch((err) => {
		logger.warning(err.message);
	}).then(() => {
		return require("../applogic/libs/seed-db")();
	}).then(() => {
		logger.debug("Seeding done!");
	});	
};
