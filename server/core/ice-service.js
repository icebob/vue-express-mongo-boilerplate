let _ 				= require("lodash");

let IceServices 	= require("ice-services");

class Service extends IceServices.Service {

	constructor(broker, schema) {
		super(broker, schema);

		if (this.settings.rest || this.settings.ws || this.settings.graphql) {
			broker.on("www.listen", () => {
				let schema = this.publishActions();
				if (schema) {
					broker.emit("publish.actions", schema);
				}
			});

			this.publishActions();
		}
	}

	publishActions() {
		if (!this.schema.actions) return;

		let schema = {
			namespace: this.settings.namespace || this.name,
			version: this.version,
			latestVersion: this.settings.latestVersion,
			idParamName: "code"
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

		let ns = schema.namespace;

		_.forIn(this.schema.actions, (actionFunc, actionName) => {
			let action;
			if (_.isFunction(actionFunc)) {
				action = {
					handler: actionFunc
				};
			} else {
				action = actionFunc;
			}

			if (!action.name)
				action.name = actionName;

			if (!action.permission)
				action.permission = this.settings.permission;

			if (!action.role)
				action.role = this.settings.role;

			let actionCallName = `${this.name}.${action.name}`;

			if (this.settings.rest)	{
				let routes = schema.rest.routes;

				// Register every action with GET and POST method types
				// So you can call the /api/{service}/{action} with these request methods.
				//
				// 		GET  /api/{service}/{action}?id=123
				// 		POST /api/{service}/{action}?id=123
				routes.unshift({
					method: "get",
					path: `/${ns}/${action.name}`,
					action: actionCallName,
					permission: action.permission,
					role: action.role
				});
				routes.unshift({
					method: "post",
					path: `/${ns}/${action.name}`,
					action: actionCallName,
					permission: action.permission,
					role: action.role
				});

				// You can call with ID in the path 
				// 		GET  /api/{service}/123/{action}
				// 		POST /api/{service}/123/{action}
				routes.unshift({
					method: "get",
					path: `/${ns}/:${schema.idParamName}/${action.name}`,
					action: actionCallName,
					permission: action.permission,
					role: action.role
				});
				routes.unshift({
					method: "post",
					path: `/${ns}/:${schema.idParamName}/${action.name}`,
					action: actionCallName,
					permission: action.permission,
					role: action.role
				});	

				// Register name-specific short-hand paths
				switch(action.name) {

				// You can call the `find` action with 
				// 		GET /api/{service}
				case "find": {
					routes.push({
						method: "get",
						path: `/${ns}`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});
					break;
				}

				// You can call the `get` action with
				// 		GET /api/{service}/?id=123 
				// 	or 
				// 		GET /api/{service}/123
				case "get": {
					routes.push({
						method: "get",
						path: `/${ns}/:${schema.idParamName}`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});
					break;
				}

				// You can call the `create` action with 
				// 		POST /api/{service}
				case "create": {
					routes.push({
						method: "post",
						path: `/${ns}/:${schema.idParamName}`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});
					routes.unshift({
						method: "post",
						path: `/${ns}/`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});
					break;
				}

				// You can call the `update` action with
				// 		PUT /api/{service}/?id=123 
				// 		PUT /api/{service}/123
				// 	or 
				// 		PATCH /api/{service}/?id=123 
				// 		PATCH /api/{service}/123
				case "update": {
					routes.push({
						method: "put",
						path: `/${ns}/:${schema.idParamName}`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});
					routes.push({
						method: "put",
						path: `/${ns}/`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});

					routes.push({
						method: "patch",
						path: `/${ns}/:${schema.idParamName}`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});
					routes.push({
						method: "patch",
						path: `/${ns}/`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});
					break;
				}

				// You can call the `remove` action with 
				// 		DELETE /api/{service}/?id=123 
				// 	or 
				// 		DELETE /api/{service}/123
				case "remove": {
					routes.push({
						method: "delete",
						path: `/${ns}/:${schema.idParamName}`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});
					routes.push({
						method: "delete",
						path: `/${ns}/`,
						action: actionCallName,
						permission: action.permission,
						role: action.role
					});					
					break;
				}
				}		

			}
			
			if (this.settings.ws) {
				schema.ws.routes.push({
					path: `/${ns}/${action.name}`,
					action: actionCallName,
					permission: action.permission,
					role: action.role
				});
			}
		});

		if (this.settings.graphql) {
			schema.graphql = this.schema.graphql;
		}		

		this.logger.info("Schema", schema);

		return schema;
	}
}

module.exports = Service;