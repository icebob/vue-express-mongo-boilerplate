"use strict";

let logger 			= require("./logger");
let config 			= require("../config");
let C 				= require("./constants");

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
				roles: [C.ROLE_ADMIN, C.ROLE_USER],
				verified: true
			});
			users.push(admin.save());

			let test = new User({
				fullName: "Test User",
				email: "test@boilerplate-app.com",
				username: "test",
				password: "test1234",
				provider: "local",
				roles: [C.ROLE_USER],
				verified: true,
				apiKey: tokgen()
			});			
			users.push(test.save());

			return Promise.all(users)
			.then(() => {
				if (!config.isProductionMode()) {
					// Create fake users
					return Promise.all(_.times(10, () => {
						let fakeUser = fakerator.entity.user();
						let user = new User({
							fullName: fakeUser.firstName + " " + fakeUser.lastName,
							email: fakeUser.email,
							username: fakeUser.userName,
							password: fakeUser.password,
							provider: "local",
							roles: [C.ROLE_USER],
							verified: true
							//apiKey: tokgen()
						});
						users.push(user.save());					
					}));
				}				
			})
			.then(() => {
				logger.warn("Default users created!");
			});
		}
	}).catch((err) => {
		logger.error(err);
	}).then(() => {
		return require("../applogic/libs/seed-db")();
	}).then(() => {
		logger.debug("Seeding done!");
	});	
};
