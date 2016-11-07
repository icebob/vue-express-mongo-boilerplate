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

/**
 * Service handler class
 */
let Services = function() {
	this.app = null;
	this.db = null;
	this.services = {};
}

/**
 * Load built-in and applogic services. Scan the folders
 * and load service files
 * @param  {Object} app ExpressJS instance
 * @param  {Object} db  Database instance
 */
Services.prototype.loadServices = function(app, db) {
	let self = this;
	self.app = app;
	self.db = db;

	let addService = function(service) {
		if (_.isFunction(service.init)) {
			service.init(Context.CreateToServiceInit(service, app, db))
		}
		self.services[service.name] = service;
	}

	logger.info("");
	logger.info(chalk.bold("Search built-in services..."));

	let modules = require.context("../services", true, /\.js$/);
	modules.keys().map(function(module) {
		logger.info("  Load", path.relative(path.join(__dirname, "..", "services"), module), "service...");
		addService(modules(module));
	});

	logger.info("");
	logger.info(chalk.bold("Search applogic services..."));

	modules = require.context("../applogic/modules", true, /service\.js$/)
	modules.keys().map(function(module) {
		logger.info("  Load", path.relative(path.join(__dirname, "..", "applogic", "modules"), module), "service...");
		addService(modules(module));
	});
}

/**
 * Register actions of services as REST routes
 * @param  {Object} app ExpressJS instance
 */
Services.prototype.registerRoutes = function(app) {
	let self = this;

	//logger.info("Register routes ", this.services);
	_.forIn(this.services, (service, name) => {
		if (service.rest !== false && service.actions) {

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

/**
 * Register actions of services as socket.io event handlers
 * @param  {Object} IO            Socket.IO object
 * @param  {Object} socketHandler Socket handler instance
 */
Services.prototype.registerSockets = function(IO, socketHandler) {
	let self = this;

	_.forIn(this.services, (service, name) => {
		if (service.ws !== false) {
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

		}
	});	
}

/**
 * Get actions of services as GraphQL queries & mutations schema
 */
Services.prototype.registerGraphQLSchema = function() {
	let self = this;

	let schemas = {
		queries: [],
		types: [],
		mutations: [],
		resolvers: []
	};

	_.forIn(this.services, (service, name) => {
		if (service.graphql !== false && service.graphql) {
			service.graphql.resolvers = service.graphql.resolvers || {};

			/*if (service.role) {
				// Must be authenticated
				router.use(auth.isAuthenticatedOrApiKey);

				// Need a role
				router.use(auth.hasRole(service.role));
			}*/

			let processResolvers = function(resolvers) {
				_.forIn(resolvers, (resolver, name) => {

					if (_.isString(resolver) && _.isFunction(service.actions[resolver])) {

						let handler = (root, args, context) => {
							let ctx = Context.CreateFromGraphQL(service, name, root, args, context);
							
							return Promise.resolve()
							.then(() => {
								return service.actions[resolver].call(service, ctx);
							})
							/*.then((json) => {
								response.json(res, json);
							}).catch((err) => {
								logger.error(err);
								response.json(res, null, response.BAD_REQUEST, err);
							});*/
						}

						resolvers[name] = handler;

					};

				});
			}

			if (service.graphql.resolvers.Query)
				processResolvers(service.graphql.resolvers.Query);

			if (service.graphql.resolvers.Mutation)
				processResolvers(service.graphql.resolvers.Mutation);


			schemas.queries.push(service.graphql.query);
			schemas.types.push(service.graphql.types);
			schemas.mutations.push(service.graphql.mutation);
			schemas.resolvers.push(service.graphql.resolvers);
		}

	});

	// MERGE TYPE DEFINITONS

	let mergedSchema = `

		scalar Timestamp

		type Query {
			${schemas.queries.join("\n")}
		}

		${schemas.types.join("\n")}

		type Mutation {
			${schemas.mutations.join("\n")}
		}

		schema {
		  query: Query
		  mutation: Mutation
		}
	`;

	// --- MERGE RESOLVERS

	let mergeModuleResolvers = function(baseResolvers) {
		schemas.resolvers.forEach((module) => {
			baseResolvers = _.merge(baseResolvers, module);
		});

		return baseResolvers;
	}

	return {
		schema: [mergedSchema],
		resolvers: mergeModuleResolvers({

			Timestamp: {
				__parseValue(value) {
					return new Date(value);
				},
				__serialize(value) {
					return value.getTime();
				},
				__parseLiteral(ast) {
					console.log(ast); // ???? when will be called it?
					/*if (ast.kind === Kind.INT) {
						return parseInt(ast.value, 10);
					}*/
				}
			}

		})
	};

}

/**
 * Get a service by name
 * @param  {String} serviceName Name of service
 * @return {Object}             Service instance
 */
Services.prototype.get = function(serviceName) {
	return this.services[serviceName];
}

// Export instance of class
module.exports = new Services();