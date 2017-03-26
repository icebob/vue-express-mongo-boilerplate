"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let	path 			= require("path");
let	fs 				= require("fs");
let _ 				= require("lodash");
let chalk 			= require("chalk");

let Moleculer     	= require("moleculer");
let Service     	= require("./ice-service");

/* global WEBPACK_BUNDLE */
if (!WEBPACK_BUNDLE) require("require-webpack-compat")(module, require);

let broker = new Moleculer.ServiceBroker({
	// cacher: new Moleculer.Cachers.Memory(),
	logger,
	nodeID: config.nodeID,
	metrics: false
});


function loadServices(broker) {

	let addService = function(serviceSchema) {
		let service = new Service(broker, serviceSchema);
		return service;
	};

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
}

loadServices(broker);

module.exports = broker;
