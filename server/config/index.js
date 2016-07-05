"use strict";

let _ 		= require("lodash");
let glob 	= require("glob");
let logger 	= require("../core/logger");

module.exports = {

	isDevMode() {
		return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
	}, 

	isProductionMode() {
		return process.env.NODE_ENV === "production";
	},

	isTestMode() {
		return process.env.NODE_ENV === "test";
	},

	getGlobbedFiles(globPatterns, removeRoot) {
		let _this, files, output, urlRegex;
		_this = this;
		urlRegex = new RegExp("^(?:[a-z]+:)?//", "i");
		output = [];
		if (_.isArray(globPatterns)) {
			globPatterns.forEach(function(globPattern) {
				output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
			});
		} else if (_.isString(globPatterns)) {
			if (urlRegex.test(globPatterns)) {
				output.push(globPatterns);
			} else {
				files = glob.sync(globPatterns);
				if (removeRoot) {
					files = files.map(function(file) {
						return file.replace(removeRoot, "");
					});
				}
				output = _.union(output, files);
			}
		}
		return output;
	} 
};

let config = {};
if (module.exports.isTestMode()) {
	logger.info("Load test config...");
	config = require("./test");
}
else if (module.exports.isProductionMode()) {
	logger.info("Load production config...");
	config = require("./prod");
}

module.exports = _.defaultsDeep(module.exports, config, require("./default"));

