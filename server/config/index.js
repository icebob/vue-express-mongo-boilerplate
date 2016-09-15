"use strict";

let path 	= require("path");
let _ 		= require("lodash");

global.rootPath = path.normalize(path.join(__dirname, "..", ".."));

// console.log("Application root path: " + global.rootPath);

if (WEBPACK_BUNDLE) {
	let bundleFullPath;
	if (process.argv.length > 0)
		bundleFullPath = process.argv[1];
	else
		bundleFullPath = path.dirname(process.argv[0]);
	
	global.rootPath = path.normalize(path.join(path.dirname(bundleFullPath), ".."));
}

module.exports = {

	isDevMode() {
		return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
	}, 

	isProductionMode() {
		return process.env.NODE_ENV === "production";
	},

	isTestMode() {
		return process.env.NODE_ENV === "test";
	}
};

let config = {};
if (module.exports.isTestMode()) {
	console.log("Load test config...");
	config = require("./test");
}
else if (module.exports.isProductionMode()) {
	console.log("Load production config...");
	config = require("./prod");
}

module.exports = _.defaultsDeep(module.exports, config, require("./default"));

