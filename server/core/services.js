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
	this.app = null;
	this.db = null;
	this.services = {};
}

Services.prototype.loadServices = function(app, db) {
	let self = this;
	self.app = app;
	self.db = db;

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
	let self = this;

	//logger.info("Register routes ", this.services);
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

				// Create default RESTful handlers
				switch (name) {
					case "find": {
						router.get("/", handler);	
						break;
					}
					case "save": {
						router.post("/", handler);	
						break;
					}
					case "update": {
						router.put("/", handler);	
						break;
					}
					case "remove": {
						router.delete("/", handler);	
						break;
					}
				}

			});

			// Register router to namespace
			app.use("/" + service.namespace, router);

			// Register a version namespace
			if (service.version) {
				app.use("/v" + service.version + "/" + service.namespace, router);
			}
		}
	});
}

Services.prototype.registerSockets = function(IO, socketHandler) {
	let self = this;

	_.forIn(this.services, (service, name) => {
		if (service.ws !== false) {
			logger.info("Register socket handlers for " + name);
			service.socket = service.socket || {};

			// get namespace IO
			let io;
			if (service.socket.ns && service.socket.ns !== "/") {
				io = socketHandler.addNameSpace(service.socket.ns, service.role);
			}
			else
				io = IO;

			service.io = io;

			io.on("connection", function (socket) {
				if (_.isFunction(service.socket.afterConnection)) {
					service.socket.afterConnection.call(service, socket, io);
				}

				_.forIn(service.actions, (action, name) => {

					let cmd = "/" + service.namespace + "/" + name;

					let handler = (data) => {
						logger.debug("Socket '" + cmd + "'", data);
						let ctx = Context.CreateFromSocket(service, self.app, socket, cmd, data);
						
						Promise.resolve()
						.then(() => {
							return action.call(service, ctx);
						})
						.then((json) => {
							//response.json(res, json);
							logger.info("Socket response", json);
						}).catch((err) => {
							logger.error(err);
							//response.json(res, null, response.BAD_REQUEST, err);
						});

					}

					socket.on(cmd, handler);

					if (service.version) {
						socket.on("/v" + service.version + cmd, handler);
					}

				});

			});

			// Initialize every socket handler
			/*socketHandlers.handlers.forEach((Handler) => {
				if (!Handler || !Handler.namespace) return;

				let io = self.namespaces[Handler.namespace];
				if (io == null) {
					io = IO.of(Handler.namespace);
					self.initNameSpace(Handler.namespace, io, mongoStore, Handler.role);
					
					if (_.isFunction(Handler.init))
						Handler.init(io);
				}
			});*/

		}
	});	
}

Services.prototype.registerGraphQLDefs = function() {
	
}

module.exports = new Services();