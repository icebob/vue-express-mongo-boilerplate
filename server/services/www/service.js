"use strict";

let logger 		= require("../../core/logger");
let config 		= require("../../config");

let E 			= require("../../core/errors");
let C 			= require("../../core/constants");

let auth		= require("./auth/helper");
let tokgen		= require("../../libs/tokgen");

let _	 		= require("lodash");
let express		= require("express");

module.exports = {
	name: "www",

	// Exposed actions
	actions: {
		publish(ctx) {
			this.logger.info("Publish schema:", ctx.params.schema);
			if (ctx.params.schema.rest)
				this.registerRESTRoutes(ctx.params.schema);
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
		 * @param  {Object} req        	ExpressJS req object
		 * @param  {String} permission  Permission of action (optional, default: PERM_LOGGEDIN)
		 * @param  {String} role  		Role of action (optional, default: ROLE_USER)
		 * @returns {Promise}
		 */		
		checkActionPermission(req, permission = C.PERM_LOGGEDIN, role = C.ROLE_USER) {
			if (permission == C.PERM_PUBLIC)
				return Promise.resolve();

			return Promise.resolve()
				// check logged in
				.then(() => {
					if (!req.user)
						throw new E.RequestError(E.UNAUTHORIZED);
				})

				// check role
				.then(() => {
					if (permission == C.PERM_ADMIN && req.user.roles.indexOf(C.ROLE_ADMIN)) {
						throw new E.RequestError(E.FORBIDDEN);
					}
					else if ([C.PERM_OWNER, C.PERM_LOGGED_IN].indexOf(permission) !== -1 && req.user.roles.indexOf(role) === -1) {
						throw new E.RequestError(E.FORBIDDEN);
					}
				});
				/*
				// check owner
				.then(() => {
					if (permission == C.PERM_OWNER && _.isFunction(this.service.$schema.ownerChecker)) {
						return this.service.$schema.ownerChecker(this).catch((err) => {
							if (_.isObject(err))
								throw err;
							else
								this.errorForbidden(C.ERR_ONLY_OWNER_CAN_EDIT_AND_DELETE, this.t("app:YouAreNotTheOwner"));
						});
					}
				});*/
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
						params.$user = {
							id: user.id,
							roles: user.roles
						};
						this.logger.debug(`Request via REST '${route.path}'`, params);
						console.time("REST request " + requestID);

						Promise.resolve()
						// Check permission
						.then(() => {
							return this.checkActionPermission(req, route.permission, route.role);
						})

						// Call the action handler
						.then(() => {
							return this.broker.call(route.action, params, null, requestID);
						})

						// Response the result
						.then((json) => {
							res.append("Request-Id", requestID);
							this.sendJSON(res, json);
						})

						// Response the error
						.catch((err) => {
							this.logger.error("Request error: ", err);
							this.sendJSON(res, null, err, req);
						})

						.then(() => {
							console.timeEnd("REST request " + requestID);
							//logger.debug("Response time:", ctx.responseTime(), "ms");
						});

					};

					router[route.method || "get"](route.path, handler);
				});

				// Register a version namespace
				if (schema.version) {
					this.app.use("/api/v" + schema.version, router);
				}

				// Register router to namespace
				if (schema.latestVersion) {
					this.app.use("/api", router);
				}		

				// Add error handlers to the end
				require("./routes/errors")(this.app);
			}
		}
	},

	created() {
		this.db	= require("../../core/mongo")();
		let { server, app } = require("./express")(this.db);
		this.server = server;
		this.app = app;
		this.logger.info("Service created!");		
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
