"use strict";

let logger 		= require("../../core/logger");
let config 		= require("../../config");

let auth		= require("./auth/helper");
let response	= require("../../core/response");

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

				// let idParamName = schema.idParamName || "id";
				
				schema.rest.routes.forEach(route => {
					
					// Make the request handler for action
					let handler = (req, res) => {
						let user = req.user;
						let params = _.defaults({}, req.query, req.params, req.body);
						this.logger.debug(`Request via REST '${route.path}'`, params);
						console.time("REST request");

						Promise.resolve()
						/*
						// Resolve model if ID provided
						.then(() => {
							return ctx.resolveModel();
						})

						// Check permission
						.then(() => {
							return ctx.checkPermission();
						})
						*/
						// Call the action handler
						.then(() => {
							return this.broker.call(route.action);
						})

						// Response the result
						.then((json) => {
							response.json(res, json);
						})

						// Response the error
						.catch((err) => {
							this.logger.error("Request error: ", err);
							response.json(res, null, err);
						})

						.then(() => {
							console.timeEnd("REST request");
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
