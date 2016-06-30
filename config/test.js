"use strict";

let pkg = require("../package.json");

module.exports = {
	app: {
		title: pkg.name + " [Test mode]"
	},
	
	test: true,

	db: {
		uri: process.env.MONGO_URI || "mongodb://localhost/" + pkg.config.dbName + "-test",
		options: {
			user: "",
			pass: ""
		}
	}
};