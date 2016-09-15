/* global __dirname */
"use strict";

let logger 			= require("../core/logger");
let config 			= require("../config");

let path 			= require("path");
let chalk 			= require("chalk");

if (!WEBPACK_BUNDLE) require('require-webpack-compat')(module, require);


module.exports = function(app, db) {
	logger.info("");
	logger.info(chalk.bold("Search routes..."));

	function requireAll(r) { 
		return r.keys().map(function(module) {
			logger.info("  Load", path.relative(path.join(__dirname, "modules"), module), "route...");
			let router = r(module);
			router(app, db);

			return router;
		})
	}
	var modules = requireAll(require.context("./modules", true, /routes\.js$/));
};