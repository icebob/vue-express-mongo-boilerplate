"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let EventEmitter	= require("events").EventEmitter;
let	path 			= require("path");
let	fs 				= require("fs");
let	util 			= require("util");
let _ 				= require("lodash");
let chalk 			= require("chalk");
let express			= require("express");

let C 				= require("./constants");
let Context 		= require("./context");
let auth			= require("./auth/helper");
let response		= require("./response");

/* global WEBPACK_BUNDLE */
if (!WEBPACK_BUNDLE) require("require-webpack-compat")(module, require);

/**
 * Service handler class
 */
let Services = function() {
	this.setMaxListeners(0); // turn off

	this.app = null;
	this.db = null;
	this.services = {};

};

/**
 * Inherit from EventEmitter
 */
Services.prototype.__proto__ = EventEmitter.prototype;

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
		service.app = app;
		service.db = db;
		if (_.isFunction(service.init)) {
			service.init(Context.CreateToServiceInit(service, app, db));
		}
		self.services[service.name] = service;
	};

	if (fs.existsSync(path.join(__dirname, "..", "services"))) {
		logger.info("");
		logger.info(chalk.bold("Search built-in services..."));

		let modules = require.context("../services", true, /\.js$/);
		if (modules) {
			modules.keys().map(function(module) {
				logger.info("  Load", path.relative(path.join(__dirname, "..", "services"), module), "service...");
				addService(modules(module));
			});
		}
	}

	if (fs.existsSync(path.join(__dirname, "..", "applogic", "modules"))) {
		logger.info("");
		logger.info(chalk.bold("Search applogic services..."));

		let modules = require.context("../applogic/modules", true, /service\.js$/);
		if (modules) {
			modules.keys().map(function(module) {
				logger.info("  Load", path.relative(path.join(__dirname, "..", "applogic", "modules"), module), "service...");
				addService(modules(module));
			});
		}
	}
};



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

			// Trying authenticate with API key
			router.use(auth.tryAuthenticateWithApiKey);

			let idParamName = service.idParamName || "id";

			_.forIn(service.actions, (action, name) => {

				// Handle shorthand action defs
				if (_.isFunction(action)) {
					action = {
						handler: action
					};
				}
				action.name = action.name || name;

				if (!_.isFunction(action.handler))
					throw new Error(`Missing handler function in '${name}' action in '${service.name}' service!`);

				// Make the request handler for action
				let handler = (req, res) => {
					let ctx = Context.CreateFromREST(service, action, app, req, res);
					logger.debug(`Request via REST '${service.namespace}/${action.name}'`, ctx.params);
					this.emit("request-rest", ctx);

					Promise.resolve()

					// Resolve model if ID provided
					.then(() => {
						return ctx.resolveModel();
					})

					// Check permission
					.then(() => {
						return ctx.checkPermission();
					})

					// Call the action handler
					.then(() => {
						return action.handler.call(service, ctx);
					})

					// Response the result
					.then((json) => {
						response.json(res, json);
					})

					// Response the error
					.catch((err) => {
						logger.error(err);
						response.json(res, null, err);
					});

				};

				// Register handler to all method types
				// So you can call the /api/namespace/action with any request method.
				router.all("/" + name, handler);
				router.all("/" + name + "/:" + idParamName, handler);

				// Create default RESTful handlers
				switch (name) {

				// You can call the find action with 
				// 		GET /api/namespace/
				case "find": {
					router.get("/", handler);	
					break;
				}

				// You can call the get action with
				// 		GET /api/namespace/?id=123 
				// 	or 
				// 		GET /api/namespace/123
				case "get": {
					//router.get("/:" + idParamName, handler);	
					break;
				}

				// You can call the save action with 
				// 		POST /api/namespace/
				case "save": {
					router.post("/:" + idParamName, handler);	
					router.post("/", handler);	
					break;
				}

				// You can call the update action with
				// 		PUT /api/namespace/?id=123 
				// 	or 
				// 		PATCH /api/namespace/?id=123 
				// 	or 
				// 		PUT /api/namespace/123
				// 	or 
				// 		PATCH /api/namespace/123
				case "update": {
					router.put("/:" + idParamName, handler);	
					router.patch("/:" + idParamName, handler);	

					router.put("/", handler);	
					router.patch("/", handler);	
					break;
				}

				// You can call the remove action with 
				// 		DELETE /api/namespace/?id=123 
				// 	or 
				// 		DELETE /api/namespace/123
				case "remove": {
					router.delete("/:" + idParamName, handler);	
					router.delete("/", handler);	
					break;
				}
				}

			});

			// Register router to namespace
			app.use("/api/" + service.namespace, router);

			// Register a version namespace
			if (service.version) {
				app.use("/api/v" + service.version + "/" + service.namespace, router);
			}
		}
	});
};

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
			if (service.socket.nsp && service.socket.nsp !== "/") {
				io = socketHandler.addNameSpace(service.socket.nsp, service.role);
			}
			else
				io = IO;

			service.io = io;

			io.on("connection", function (socket) {
				if (_.isFunction(service.socket.afterConnection)) {
					service.socket.afterConnection.call(service, socket, io);
				}

				_.forIn(service.actions, (action, name) => {

					// Handle shorthand action defs
					if (_.isFunction(action)) {
						action = {
							handler: action
						};
					}
					action.name = action.name || name;

					if (!_.isFunction(action.handler))
						throw new Error(`Missing handler function in '${name}' action in '${service.name}' service!`);

					let cmd = "/" + service.namespace + "/" + action.name;

					let handler = (data, callback) => {
						let ctx = Context.CreateFromSocket(service, action, self.app, socket, data);
						logger.debug(`Request via WebSocket '${service.namespace}/${action.name}'`, ctx.params);
						self.emit("request-socket", ctx);
						
						Promise.resolve()

						// Resolve model if ID provided
						.then(() => {
							return ctx.resolveModel();
						})

						// Check permission
						.then(() => {
							return ctx.checkPermission();
						})

						// Call the action handler
						.then(() => {
							return action.handler.call(service, ctx);
						})

						// Response the result
						.then((json) => {
							if (_.isFunction(callback)) {
								callback(response.json(null, json));
							}
						})

						// Response the error
						.catch((err) => {
							logger.error(err);
							if (_.isFunction(callback)) {
								callback(response.json(null, null, err));
							}
						});

					};

					socket.on(cmd, handler);

					if (service.version) {
						socket.on("/v" + service.version + cmd, handler);
					}

				});

			});

		}
	});	
};

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

			let processResolvers = function(resolvers) {
				_.forIn(resolvers, (resolver, name) => {

					if (_.isString(resolver) && service.actions[resolver]) {

						let handler = (root, args, context) => {

							let action = service.actions[resolver];

							// Handle shorthand action defs
							if (_.isFunction(action)) {
								action = {
									handler: action
								};
							}
							action.name = action.name || name;							

							if (!_.isFunction(action.handler))
								throw new Error(`Missing handler function in '${name}' action in '${service.name}' service!`);
						
							let ctx = Context.CreateFromGraphQL(service, action, root, args, context);
							logger.debug("Request via GraphQL", ctx.params, context.query);
							self.emit("request-graphql", ctx);
							
							return Promise.resolve()
							
							// Resolve model if ID provided
							.then(() => {
								return ctx.resolveModel();
							})

							// Check permission
							.then(() => {
								return ctx.checkPermission();
							})

							// Call the action handler
							.then(() => {
								return action.handler.call(service, ctx);
							})
							/*.then((json) => {
								logger.debug("GraphQL response:", json)
							})*/
							.catch((err) => {
								logger.error(err);
								throw err;
							});
						};

						resolvers[name] = handler;

					}

				});
			};

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

	// Merge Type Definitons

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

	// Merge Resolvers

	let mergeModuleResolvers = function(baseResolvers) {
		schemas.resolvers.forEach((module) => {
			baseResolvers = _.merge(baseResolvers, module);
		});

		return baseResolvers;
	};

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

};

/**
 * Get a service by name
 * @param  {String} serviceName Name of service
 * @return {Object}             Service instance
 */
Services.prototype.get = function(serviceName) {
	return this.services[serviceName];
};

// Export instance of class
module.exports = new Services();
