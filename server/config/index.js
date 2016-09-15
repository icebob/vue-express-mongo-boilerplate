"use strict";

let _ 		= require("lodash");

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

