"use strict";

let logger 			= require("../core/logger");
let config 			= require("../config");

let path 			= require("path");
let chalk 			= require("chalk");

if (!WEBPACK_BUNDLE) require('require-webpack-compat')(module, require);


logger.info("");
logger.info(chalk.bold("Search socket handlers..."));

function requireAll(r) { 
	return r.keys().map(function(module) {
		logger.info("  Load", path.relative(path.join(__dirname, "modules"), module), "handler...");
		return r(module);
	})
}

module.exports.handlers = requireAll(require.context("./modules", true, /socket\.js$/));
