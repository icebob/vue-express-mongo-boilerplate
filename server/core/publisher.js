"use strict";

let _ 				= require("lodash");

let C 				= require("../core/constants");
let E 				= require("../core/errors");

module.exports = function publishActions() {
	if (!this.schema.actions) return;

	let ns = this.settings.namespace || this.name;

	let schema = {
		namespace: ns,
		version: this.version,
		latestVersion: this.settings.latestVersion,
		hashedIdentity: this.settings.hashedIdentity,
		idParamName: this.settings.hashedIdentity ? "code" : "id"
	};

	if (this.settings.rest) {
		schema.rest = {
			routes: []
		};
	}

	if (this.settings.ws) {
		schema.ws = {
			routes: []
		};
	}

	_.forIn(this.schema.actions, (handler, actionName) => {
		let action;
		if (_.isFunction(handler))
			action = { handler };
		else
			action = handler;

		if (action.publish === false) return;

		action.name = action.name || actionName;
		action.permission = action.permission || this.settings.permission;
		action.role = action.role || this.settings.role || C.ROLE_USER;

		let actionCallName = `${this.name}.${action.name}`;

		if (this.settings.rest)	{
			let routes = schema.rest.routes;

			let addRoute = (method, path, insert) => {
				routes[insert?"unshift":"push"]({
					method,
					path,
					action: actionCallName,
					permission: action.permission,
					role: action.role
				});					
			};

			// Register every action with GET and POST method types
			// So you can call the /api/{service}/{action} with these request methods.
			// 		GET  /api/{service}/{action}?id=123
			// 		POST /api/{service}/{action}?id=123
			addRoute("get", `/${ns}/${action.name}`, true);
			addRoute("post", `/${ns}/${action.name}`, true);


			// You can also call with ID/Code in the path 
			// 		GET  /api/{service}/123/{action}
			// 		POST /api/{service}/123/{action}
			addRoute("get", `/${ns}/:${schema.idParamName}/${action.name}`, true);
			addRoute("post", `/${ns}/:${schema.idParamName}/${action.name}`, true);


			// Register name-specific short-hand paths for methods
			if (action.defaultMethod) {
				// You can call action without action name if set `defaultMethod` in action definition
				// 		{method}  /api/{service}
				// 		{method}  /api/{service}/123
				if (action.needModel)
					addRoute(action.defaultMethod.toLowerCase(), `/${ns}/:${schema.idParamName}`);
				else
					addRoute(action.defaultMethod.toLowerCase(), `/${ns}`);
			}
		}
		
		if (this.settings.ws) {
			schema.ws.routes.push({
				path: `${ns}.${action.name}`,
				action: actionCallName,
				permission: action.permission,
				role: action.role
			});
		}
	});

	if (this.settings.graphql) {
		schema.graphql = this.schema.graphql;
	}		

	return schema;
};