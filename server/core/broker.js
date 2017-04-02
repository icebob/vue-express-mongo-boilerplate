"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let	path 			= require("path");
let	fs 				= require("fs");
let _ 				= require("lodash");
let chalk 			= require("chalk");

let Moleculer     	= require("moleculer");
let APIService     	= require("./api-service");

/* global WEBPACK_BUNDLE */
if (!WEBPACK_BUNDLE) require("require-webpack-compat")(module, require);

// Create cache module
let cacher;
if (config.cacheTimeout > 0) {
	cacher = new Moleculer.Cachers.Memory({
		ttl: config.cacheTimeout
	});
}

// Create service broker
let broker = new Moleculer.ServiceBroker({
	cacher,
	logger,
	logLevel: "debug",
	nodeID: config.nodeID,
	metrics: true,
	statistics: false,
	ServiceFactory: APIService
});

// Load services
if (WEBPACK_BUNDLE || fs.existsSync(path.join(__dirname, "..", "services"))) {
	logger.info("");
	logger.info(chalk.bold("Load built-in services..."));

	let ctx = require.context("../services", true, /service\.js$/);
	if (ctx) {
		ctx.keys().map(function(filename) {
			let svcName = path.relative(path.join(__dirname, "..", "services"), filename).replace(/.js$/, "");
			logger.info(`  Load ${svcName}`);
			addService(ctx(filename));
		});
	}
}

function addService(serviceSchema) {
	let service = broker.createService(serviceSchema);
	return service;
}

module.exports = broker;
