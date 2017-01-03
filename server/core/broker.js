"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let	path 			= require("path");
let	fs 				= require("fs");
let _ 				= require("lodash");
let chalk 			= require("chalk");

let IceServices     = require("ice-services");
let Service     	= require("./ice-service");

/* global WEBPACK_BUNDLE */
if (!WEBPACK_BUNDLE) require("require-webpack-compat")(module, require);

let broker = new IceServices.ServiceBroker({
	cacher: new IceServices.Cachers.Memory(),
	logger,
	nodeID: config.nodeID,
	metrics: true
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
				logger.info("  Load", path.relative(path.join(__dirname, "..", "services"), filename), "service...");
				addService(ctx(filename));
			});
		}
	}
	/*
	if (WEBPACK_BUNDLE || fs.existsSync(path.join(__dirname, "..", "applogic", "modules"))) {
		logger.info("");
		logger.info(chalk.bold("Search applogic services..."));

		let files = require.context("../applogic/modules", true, /service\.js$/);
		if (files) {
			files.keys().map(function(module) {
				logger.info("  Load", path.relative(path.join(__dirname, "..", "applogic", "modules"), module), "service...");
				addService(files(module));
			});
		}
	}
	

	// Call `init` of services
	_.forIn(self.services, (service) => {
		if (_.isFunction(service.$schema.init)) {
			service.$schema.init.call(service, Context.CreateToServiceInit(service));
		}
	});
	*/
}

loadServices(broker);

module.exports = broker;
