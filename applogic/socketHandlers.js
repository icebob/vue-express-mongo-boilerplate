'use strict';

let logger 			= require('../core/logger');
let config 			= require("../config");

let path 			= require("path");
let chalk 			= require("chalk");

logger.info("");
logger.info(chalk.bold("Search socket handlers..."));

module.exports.handlers = config.getGlobbedFiles(path.join(__dirname, "modules", "**", "*socket.js"));

module.exports.handlers.forEach((file) => {
	logger.info("  Found", path.relative(path.join(__dirname, "modules"), file), "handler...");
});