"use strict";

let path 	= require("path");
let fs 		= require("fs");
let pkg 	= require("../../package.json");
let _ 		= require("lodash");

let externalConfig = {};

let baseConfig = {
	app: {
		url: "http://vemapp.e-paper.space/",
		//googleAnalyticsID: 'UA-xxxxx-x',
		contactEmail: "hello@e-paper.space"
	},
	
	ip: process.env.NODE_IP || "127.0.0.1",
	port: process.env.NODE_PORT || 3000,

	db: {
		uri: process.env.MONGO_URI || "mongodb://localhost/" + pkg.config.dbName,
		options: {
			user: process.env.MONGO_USERNAME || "",
			pass: process.env.MONGO_PASSWORD || ""
		}
	}
};

const fName = path.join(global.rootPath, "configuration.js"); 

try {
	if (fs.existsSync(fName))
		externalConfig = JSON.parse(fs.readFileSync(fName));
} catch (error) {
	console.error("Unable to load external configuration", error);
}

module.exports = _.defaultsDeep(externalConfig, baseConfig);