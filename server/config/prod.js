"use strict";

let pkg = require("../../package.json");

module.exports = {
	app: {},
	
	ip: process.env.NODE_IP || "127.0.0.1",
	port: process.env.NODE_PORT || 3000,

	db: {
		uri: process.env.MONGO_URI || "mongodb://localhost/" + pkg.config.dbName,
		options: {
			user: "",
			pass: ""
		}
	}

};