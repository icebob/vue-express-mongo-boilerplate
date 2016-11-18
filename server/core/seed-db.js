"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let _ 				= require("lodash");
let tokgen 			= require("../libs/tokgen");
let fakerator		= require("fakerator")();

let User 			= require("../models/user");

module.exports = function() {
	return User.find({}).exec().then((docs) => {
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

			return admin.save();
		} else 
			throw new Error("No need to seed the Users table!");
	}).then(function() {
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
		
		return test.save();
	}).then(() => {
		logger.info("Default users created!");
	}).catch((err) => {
		console.warn("Seeding: ", err.message);
	}).then(() => {
		return require("../applogic/libs/seed-db")();
	}).then(() => {
		logger.info("Seeding done!");
	});	
};
