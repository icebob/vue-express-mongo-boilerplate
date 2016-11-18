"use strict";

let logger 	= require("../core/logger");
let config	= require("../config");
let fs		= require("fs");
let mkdirp 	= require("mkdirp");

// Create data folder if not exist
if (!fs.existsSync(config.dataFolder)) {
	mkdirp.sync(config.dataFolder);
}

// Show config in dev mode
if (config.isDevMode()) {
	logger.info("Loaded configuration:");
	logger.info(config);
	logger.info();
}
