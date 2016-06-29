"use strict";

module.exports = {
	app: {
		title: pkg.name + " [Test mode]"
	},
	
	test: true,

	db: {
		uri: process.env.MONGO_URI || "mongodb://mongo/" + pkg.config.dbName + "-test",
		options: {
			user: "",
			pass: ""
		}
	}
};