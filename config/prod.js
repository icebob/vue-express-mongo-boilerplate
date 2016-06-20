"use strict";

let pkg = require("../package.json");

module.exports = {
	app: {
    	url: 'http://e-paper-space/'
	},
	ip: process.env.SERVER_IP || '127.0.0.1',

	db: {
		//uri: process.env.MONGO_URI || "mongodb://mongo/" + pkg.config.dbName,
		options: {
			user: '',
			pass: ''
		}
	}

}