/* global __dirname */
"use strict";

let logger 			= require("../core/logger");
let config 			= require("../config");

let path 			= require("path");
let chalk 			= require("chalk");

module.exports = function(app, db) {

	logger.info("");
	logger.info(chalk.bold("Search routes..."));

	let files = config.getGlobbedFiles(path.join(__dirname, "modules", "**", "*routes.js"));

	// Load route files
	files.forEach((file) => {
		logger.info("  Load", path.relative(path.join(__dirname, "modules"), file), "route...");
		require(path.resolve(file))(app, db);
	});
};