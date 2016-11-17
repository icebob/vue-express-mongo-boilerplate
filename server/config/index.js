"use strict";

let path 	= require("path");
let fs 		= require("fs");
let _ 		= require("lodash");
let chalk	= require("chalk");

global.rootPath = path.normalize(path.join(__dirname, "..", ".."));
console.log("process.argv: " + process.argv);

if (WEBPACK_BUNDLE) {
	let bundleFullPath;
	if (process.argv.length > 0)
		bundleFullPath = process.argv[1];
	else
		bundleFullPath = process.cwd();
		// bundleFullPath = path.dirname(process.argv[0]);
	
	global.rootPath = path.normalize(path.join(path.dirname(bundleFullPath), ".."));
}

console.log("Application root path: " + global.rootPath);

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

// Load external configuration if exists `config.js`
let externalConfig = {};

const extConfigFile = path.join(global.rootPath, "config.js"); 

try {
	if (fs.existsSync(extConfigFile))
		externalConfig = require(extConfigFile);
	else
		console.warn(chalk.bold(chalk.yellow("External production configuration not found!. Please create a `configuration.js` file!")));

} catch (error) {
	console.warn("Unable to load external production config.js file!", error);
}



let config = {};
if (module.exports.isTestMode()) {
	console.log("Load test config...");
	config = require("./test");
}
else if (module.exports.isProductionMode()) {
	console.log("Load production config...");
	config = require("./prod");
}

module.exports = _.defaultsDeep(module.exports, externalConfig, config, require("./default"));

