"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let	path 			= require("path");
let	fs 				= require("fs");
let _ 				= require("lodash");
let chalk 			= require("chalk");
let express			= require("express");

let Context 		= require("./context");
let auth			= require("./auth/helper");
let response		= require("./response");

if (!WEBPACK_BUNDLE) require('require-webpack-compat')(module, require);

let Services = function() {
	this.services = {};
}

Services.prototype.loadServices = function(app, db) {
	let self = this;

	logger.info("");
	logger.info(chalk.bold("Search built-in services..."));

	function requireAllBuiltIn(r) { 
		return r.keys().map(function(module) {
			logger.info("  Load", path.relative(path.join(__dirname, "..", "services"), module), "service...");
			let service = r(module);
			if (_.isFunction(service.init)) {
				service.init(Context.CreateToServiceInit(service, app, db))
			}
			self.services[service.name] = service;
		})
	}
	requireAllBuiltIn(require.context("../services", true, /\.js$/));


	logger.info("");
	logger.info(chalk.bold("Search applogic services..."));

	function requireAllAppLogic(r) { 
		return r.keys().map(function(module) {
			logger.info("  Load", path.relative(path.join(__dirname, "..", "applogic", "modules"), module), "service...");
			let service = r(module);
			if (_.isFunction(service.init)) {
				service.init(Context.CreateToServiceInit(service, app, db))
			}
			self.services[service.name] = service;
		})
	}
	requireAllAppLogic(require.context("../applogic/modules", true, /service\.js$/));

	// logger.info(this.services);
}

Services.prototype.registerRoutes = function(app) {
	logger.info("Register routes ", this.services);
	_.forIn(this.services, (service, name) => {
		if (service.rest !== false && service.actions) {
			logger.info("Register routes for " + name);

			let router = express.Router();

			if (service.role) {
				// Must be authenticated
				router.use(auth.isAuthenticatedOrApiKey);

				// Need a role
				router.use(auth.hasRole(service.role));
			}

			_.forIn(service.actions, (action, name) => {

				let handler = (req, res) => {
					let ctx = Context.CreateFromREST(service, app, req, res);
					
					Promise.resolve()
					.then(() => {
						return action.call(service, ctx);
					})
					.then((json) => {
						response.json(res, json);
					}).catch((err) => {
						logger.error(err);
						response.json(res, null, response.BAD_REQUEST, err);
					});

				}

				router.all("/" + name, handler);

				if (name == "find") {
					// `find` is the default route
					router.all("/", handler);
				}

			});

			// Register router to namespace
			app.use(service.namespace, router);

			// Register a version namespace
			if (service.version) {
				app.use("/v" + service.version + service.namespace, router);
			}
		}
	});
}

Services.prototype.registerSockets = function(io) {
	
}

Services.prototype.registerGraphQLDefs = function() {
	
}

module.exports = new Services();