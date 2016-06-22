'use strict';

let logger 			= require('../../core/logger');
let config 			= require("../../config");

let path 			= require("path");

module.exports = function(app, db) {

	logger.info("");
	logger.info("Search routes...");

	let files = config.getGlobbedFiles(path.join(__dirname, "**", "*.js"));

	// Load route files
	files.forEach((file) => {
		if (file.indexOf("index.js") != -1) return;

		logger.info("  Load", path.basename(file), "route...");
		require(path.resolve(file))(app, db);
	});
}