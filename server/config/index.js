"use strict";

let path 	= require("path");
let fs 		= require("fs");
let _ 		= require("lodash");
let chalk	= require("chalk");
let secretUtils		= require("secret-utils");

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
	if (!fs.existsSync(extConfigFile)) {
		console.warn(chalk.yellow.bold("External production configuration not found!. Create a default `config.js` file..."));

		let template = fs.readFileSync(path.join(__dirname,  "config.template.js"));

		_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
		let compiled = _.template(template);

		let changes = {
			hashSecret: secretUtils.url64(32),
			sessionSecret: secretUtils.url64(32)
		};

		fs.writeFileSync(extConfigFile, compiled(changes));
		
		console.warn(chalk.green.bold("The `config.js` file created! Please update the settings in the file!"));		
	}
	
	externalConfig = require(extConfigFile);

} catch (error) {
	console.warn("Unable to load external production config.js file!", error);
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

