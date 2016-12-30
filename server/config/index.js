"use strict";

let path 	= require("path");
let fs 		= require("fs");
let _ 		= require("lodash");
let chalk	= require("chalk");
let tokgen	= require("../libs/tokgen");

global.rootPath = path.normalize(path.join(__dirname, "..", ".."));
console.log("process.argv: " + process.argv);

/* global WEBPACK_BUNDLE */
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
	if (!fs.existsSync(extConfigFile)) {
		console.warn(chalk.yellow.bold("External production configuration not found!. Create a default `config.js` file..."));

		let template;
		/* global WEBPACK_BUNDLE */
		if (WEBPACK_BUNDLE) {
			template = require("raw-loader!./config.template.js");
		} else {
			template = fs.readFileSync(path.join(__dirname,  "config.template.js"));
		}

		_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
		let compiled = _.template(template);

		let changes = {
			hashSecret: tokgen(),
			sessionSecret: tokgen()
		};

		fs.writeFileSync(extConfigFile, compiled(changes));
		
		console.warn(chalk.green.bold("The `config.js` file created! Please update the settings in the file!"));		
	}
	
	if (WEBPACK_BUNDLE) {
		externalConfig = require("../../config.js");
	} else {
		externalConfig = require(extConfigFile);
	}

} catch (error) {
	console.warn(chalk.red.bold("\r\n=============================================="));
	console.warn(chalk.red.bold("  Unable to load external `config.js` file!"));
	console.warn(chalk.red.bold(" ", error));
	//console.warn(chalk.red.bold(error.stack));
	console.warn(chalk.red.bold("==============================================\r\n"));
	process.exit(1);
}


let baseConfig = require("./base");

let config = {};
if (module.exports.isTestMode()) {
	console.log("Load test config...");
	config = require("./test");
	// In test mode, we don't use the external config.js file
	externalConfig = {};
}
else if (module.exports.isProductionMode()) {
	console.log("Load production config...");
	config = require("./prod");
}

module.exports = _.defaultsDeep(externalConfig, config, baseConfig, module.exports);

