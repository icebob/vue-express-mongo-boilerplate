"use strict";

let logger 		= require("../../core/logger");
let config 		= require("../../config");

let E 			= require("../../core/errors");
let C 			= require("../../core/constants");

let auth		= require("./auth/helper");
let tokgen		= require("../../libs/tokgen");

let util 		= require("util");
let _	 		= require("lodash");
let express		= require("express");

let Context		= require("Moleculer").Context;

let graphqlTools 		= require("graphql-tools");
let GraphQLScalarType 	= require("graphql").GraphQLScalarType;
let Kind				= require("graphql/language").Kind;

module.exports = {
	name: "www",

	// Exposed actions
	actions: {
		publish(ctx) {
			//this.logger.info("Publish schema:", ctx.params.schema);
			let schema = ctx.params.schema;
			let old = this.publishedSchemas[schema.namespace];
			if (old) {
				// TODO: if there is old, reregister routes
				/*
				if (schema.rest)
					this.unregisterRESTRoutes(old);
				*/
			}

			if (schema.rest)
				this.registerRESTRoutes(schema);

			this.publishedSchemas[schema.namespace] = schema;
			this.generateGraphQLSchema();
		}
	},

	// Event listeners
	events: {

	},

	// Service methods
	methods: {
		/**
		 * Generate a JSON REST API response
		 *
		 * If data present and no error, we will send status 200 with JSON data
		 * If no data but has error, we will send HTTP error code and message
		 * 
		 * @param  {Object} res        	ExpressJS res object
		 * @param  {json} 	data       	JSON response data
		 * @param  {Object} err        	Error object
		 * @param  {Object} req        	ExpressJS req object
		 * @return {json} If res assigned, send response via res, otherwise return the response JSON object
		 */
		sendJSON(res, data, err, req) {
			let response = {};

			if (err) {
				response.status = err.status || 500;
				response.error = {
					type: err.type,
					message: err.message
				};
				if (err.params) 
					response.error.params = err.params;

				if (err.msgCode) 
					response.error.message = req.t(err.msgCode);

				response.data = data;

				return res ? res.status(response.status).json(response) : response;
			}

			response.status = 200;
			response.data = data;

			return res ? res.json(response) : response;
		},

		/**
		 * Check request has enough permission to call the action
		 * 
		 * @param  {Object} user       	User of request
		 * @param  {String} permission  Permission of action (optional, default: PERM_LOGGEDIN)
		 * @param  {String} role  		Role of action (optional, default: ROLE_USER)
		 * @returns {Promise}
		 */		
		checkActionPermission(user, permission = C.PERM_LOGGEDIN, role = C.ROLE_USER) {
			if (permission == C.PERM_PUBLIC)
				return this.Promise.resolve();

			return this.Promise.resolve()
			// check logged in
			.then(() => {
				if (!user)
					throw new E.RequestError(E.UNAUTHORIZED);
			})

			// check role
			.then(() => {
				if (permission == C.PERM_ADMIN && user.roles.indexOf(C.ROLE_ADMIN) == -1) {
					throw new E.RequestError(E.FORBIDDEN);
				}
				else if ([C.PERM_OWNER, C.PERM_LOGGED_IN].indexOf(permission) !== -1 && user.roles.indexOf(role) === -1) {
					throw new E.RequestError(E.FORBIDDEN);
				}
			});
		},

		/**
		 * Register actions as REST routes
		 * 
		 * @param {Object} schema 	Schema of routes
		 */
		registerRESTRoutes(schema) {

			if (schema.rest && schema.rest.routes) {

				// Remove error handler routes from the end
				let removeErrorHandlers = function(route, i, routes) {
					switch(route.handle.name) {
					case "errorHandler500":
						routes.splice(i, 2); // remove 2 error handler
					}

					if (route.route)
						route.route.stack.forEach(removeErrorHandlers);
				};			
				this.app._router.stack.forEach(removeErrorHandlers);

				let router = express.Router();

				// Trying authenticate with API key (miért itt van, miért nem globálba?)
				router.use(auth.tryAuthenticateWithApiKey);

				schema.rest.routes.forEach(route => {
					
					// Make the request handler for action
					let handler = (req, res) => {
						let requestID = tokgen();
						let user = req.user;
						let params = _.defaults({}, req.query, req.params, req.body);
						params.$user = _.pick(user, ["id", "code", "avatar", "roles", "username", "fullName"]);
						this.logger.debug(`Request via REST '${route.path}' ${requestID}`, params);

						let ctx = new Context({
							broker: this.broker,
							requestID,
							action: {
								name: "request.rest"
							},
							metrics: this.broker.options.metrics
						});
						ctx._metricStart();

						return this.Promise.resolve()
						// Check permission
						.then(() => {
							return this.checkActionPermission(req.user, route.permission, route.role);
						})

						// Call the action handler
						.then(() => {
							return ctx.call(route.action, params);
						})

						// Response the result
						.then((json) => {
							res.append("Request-Id", requestID);
							this.sendJSON(res, json);
							ctx._metricFinish();
						})

						// Response the error
						.catch((err) => {
							this.logger.error("Request error: ", util.inspect(err, { depth: 0, colors: true }));
							this.sendJSON(res, null, err, req);
							ctx._metricFinish(err);
						});
					};

					router[route.method || "get"](route.path, handler);
				});

				// Register a version namespace
				if (schema.version) {
					this.app.use("/api/v" + schema.version, router);
				}

				// Register router to namespace
				if (schema.version == null || schema.latestVersion) {
					this.app.use("/api", router);
				}		

				// Add error handlers to the end
				require("./routes/errors")(this.app);
			}
		},

		/**
		 * Register actions as REST routes
		 * 
		 * @param {Object} socket 	Socket of ws client
		 */
		registerSocketActions(socket) {
			let user = socket.request.user;

			_.forIn(this.publishedSchemas, (schema) => {
				if (!schema.ws) return;

				schema.ws.routes.forEach(route => {

					let handler = (data, callback) => {
						let requestID = tokgen();
						
						let params = Object.assign({}, data, {
							$user: _.pick(user, ["id", "code", "avatar", "roles", "username", "fullName"])
						});

						this.logger.debug(`Request via WS '${route.path}' ${requestID}`, params);

						let ctx = new Context({
							broker: this.broker,
							requestID,
							action: {
								name: "request.ws"
							},
							metrics: this.broker.options.metrics
						});
						ctx._metricStart();

						return this.Promise.resolve()
						// Check permission
						.then(() => {
							return this.checkActionPermission(user, route.permission, route.role);
						})

						// Call the action handler
						.then(() => {
							return ctx.call(route.action, params);
						})

						// Response the result
						.then(json => {
							if (_.isFunction(callback))
								callback(this.sendJSON(null, json));
							ctx._metricFinish();
						})

						// Response the error
						.catch(err => {
							this.logger.error("Request error: ", err);
							if (_.isFunction(callback))
								callback(this.sendJSON(null, null, err));
							ctx._metricFinish(err);
						});		
									
					};

					// Register as versioned action
					if (schema.version) {
						socket.on(`v${schema.version}.${route.path}`, handler);
					}

					// Register action without version
					if (schema.version == null || schema.latestVersion) {
						socket.on(route.path, handler);
					}		

				});

			});

		},

		generateGraphQLSchema() {

			let schemas = {
				queries: [],
				types: [],
				mutations: [],
				resolvers: []
			};

			_.forIn(this.publishedSchemas, (publishSchema) => {
				if (publishSchema.graphql !== false && _.isObject(publishSchema.graphql)) {
					let graphQL = publishSchema.graphql; 
					graphQL.resolvers = graphQL.resolvers || {};

					let processResolvers = (resolvers) => {
						_.forIn(resolvers, (resolver, name) => {

							if (_.isString(resolver)) {

								let handler = (root, args, context) => {
									context.broker = this.broker;
									let requestID = tokgen();
									let actionName = `${publishSchema.namespace}.${resolver}`;
									let user = context.user;
									let params = Object.assign({}, args);
									params.$user = _.pick(user, ["id", "code", "avatar", "roles", "username", "fullName"]);
									this.logger.debug(`Request via GraphQL '${actionName}' ${requestID}`, params);

									let ctx = new Context({
										broker: this.broker,
										requestID,
										action: {
											name: "request.graphql"
										},
										metrics: this.broker.options.metrics
									});
									ctx._metricStart();

									return this.Promise.resolve()
										// Check permission
										.then(() => {
											//return this.checkActionPermission(user, route.permission, route.role);
										})

										// Call the action handler
										.then(() => {
											return ctx.call(actionName, params);
										})

										.then(json => {
											ctx._metricFinish();
											return json;
										})

										// Response the error
										.catch((err) => {
											ctx._metricFinish(err);
											this.logger.error("Request error: ", err);
											throw err;
										});						

								};

								resolvers[name] = handler.bind(this);

							}

						});
					};

					if (graphQL.resolvers.Query)
						processResolvers(graphQL.resolvers.Query);

					if (graphQL.resolvers.Mutation)
						processResolvers(graphQL.resolvers.Mutation);

					schemas.queries.push(graphQL.query);
					schemas.types.push(graphQL.types);
					schemas.mutations.push(graphQL.mutation);
					schemas.resolvers.push(graphQL.resolvers);
				}

			});

			if (schemas.queries.length == 0) {
				this.graphQLSchema = null;
				return;
			}

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

			try {
				// Generate executable graphQL schema
				let newSchema = graphqlTools.makeExecutableSchema({ 
					typeDefs: [mergedSchema], 
					resolvers: mergeModuleResolvers({
						Timestamp: {
							__parseValue(value) {
								return new Date(value); // value from the client
							},
							__serialize(value) {
								return value.getTime(); // value sent to the client
							},
							__parseLiteral(ast) {
								if (ast.kind === Kind.INT)
									return parseInt(ast.value, 10); // ast value is always in string format
								
								return null;
							}
						}
						/* This version is not working
							Copied from http://dev.apollodata.com/tools/graphql-tools/scalars.html
						*/
						/*
						Timestamp: new GraphQLScalarType({
							name: "Timestamp",
							description: "Timestamp scalar type",
							parseValue(value) {
								return new Date(value); // value from the client
							},
							serialize(value) {
								return value.getTime(); // value sent to the client
							},
							parseLiteral(ast) {
								if (ast.kind === Kind.INT) {
									return parseInt(ast.value, 10); // ast value is always in string format
								}
								return null;
							},
						}),*/
					}),
					logger: config.isDevMode() ? logger : undefined
					//allowUndefinedInResolve: false
				});

				this.graphQLSchema = newSchema;
				this.logger.info("GraphQL schema registered!");
			} catch(err) {
				this.logger.warn("GraphQL compile error:", err.message);
			}
		}
	},

	created() {
		this.publishedSchemas = {};
		this.graphQLSchema = null;
		
		this.db	= require("../../core/mongo")();
		let { server, app } = require("./express")(this.db, this);
		this.server = server;
		this.app = app;

		//this.logger.info("Service created!");		
	},

	started() {
		// this.logger.info("Service started!");
		
		this.server.listen(config.port, config.ip, () => {
			require("../../libs/sysinfo")();
			this.broker.emit("www.listen");
		});	
	},

	stopped() {
		// this.logger.info("Service stopped!");
	}
};
