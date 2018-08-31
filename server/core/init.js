"use strict";

let logger 	= require("../core/logger");
let config	= require("../config");
let fs		= require("fs");
let mkdirp 	= require("mkdirp");

// Create data folder if not exist
if (!fs.existsSync(config.dataFolder)) {
	mkdirp.sync(config.dataFolder);
}

// Print to console the full config in dev mode
if (!config.isProductionMode()) {
	logger.info("Loaded configuration:");
	logger.info(config);
	logger.info({});
}
