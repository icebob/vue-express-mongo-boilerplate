let _ 				= require("lodash");

let C 				= require("../core/constants");
let E 				= require("../core/errors");

let IceServices 	= require("ice-services");

class Service extends IceServices.Service {

	constructor(broker, schema) {
		super(broker, schema);

		if (this.settings.rest || this.settings.ws || this.settings.graphql) {
			broker.on("www.listen", () => {
				this.publishActions();
			});

			if (broker.hasAction("www.publish"))
				this.publishActions();
		}

		if (this.settings.collection)
			this.collection = this.settings.collection;
	}

	publishActions() {
		if (!this.schema.actions) return;

		let schema = {
			namespace: this.settings.namespace || this.name,
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

			if (action.publish === false) return;

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

				// You can call the `list` action with 
				// 		GET /api/{service}
				case "list": {
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

		//this.logger.info("Schema", schema);

		this.broker.call("www.publish", { schema });

		return schema;
	}

	/**
	 * Check model is exists. If not throw an error
	 * 
	 * @param {model} model				Model
	 * @param {any} errMessageCode		Error message code if model not found
	 * @returns {Object}
	 * 
	 * @memberOf Service
	 */
	checkModel(model, errMessageCode) {
		if (model)
			return model;

		throw new E.RequestError(E.BAD_REQUEST, C.MODEL_NOT_FOUND, errMessageCode);
	}

	/**
	 * Check the model owner with the user
	 * 
	 * @param {any} model			Model
	 * @param {any} fieldName		name of owner field
	 * @param {any} user			User of request
	 * @param {string} errMessageCode Error message code (optional)
	 * @returns
	 * 
	 * @memberOf Service
	 */
	checkModelOwner(model, fieldName, user, errMessageCode = "app:YouAreNotTheOwner") {
		if (model[fieldName] == user.id || user.roles.indexOf(C.ROLE_ADMIN) != -1)
			return model;

		throw new E.RequestError(E.BAD_REQUEST, C.ERR_ONLY_OWNER_CAN_EDIT_AND_DELETE, errMessageCode);
	}

	/**
	 * Convert the `docs` MongoDB model to JSON object.
	 * With `propFilter` can be filter the properties
	 * 
	 * @param {MongoDocument} 	docs		MongoDB document(s)
	 * @param {String} 			propFilter	Filter properties of model. It is a space-separated `String` or an `Array`
	 * @returns								JSON object/array
	 * 
	 * @memberOf Service
	 */
	toJSON(docs, propFilter) {
		let func = function(doc) {
			let json = doc.constructor && doc.constructor.name === "model" ? doc.toJSON() :	doc;

			if (propFilter != null)
				return _.pick(doc, propFilter);
			
			return doc;
		};

		if (propFilter == null) {
			propFilter = this.settings.modelPropFilter;
		}

		if (_.isString(propFilter)) 
			propFilter = propFilter.split(" ");

		if (_.isArray(docs)) {
			return _.map(docs, (doc) => func(doc, propFilter));
		} else if (_.isObject(docs)) {
			return func(docs);
		}
	}

	/**
	 * Process limit, offset and sort params from request
	 * and use them in the query
	 *
	 * Example:
	 * 		GET /posts?offset=20&limit=10&sort=-votes,createdAt
	 * 
	 * @param  {query} query Mongo query object
	 * @param  {Context} ctx Context of request
	 * @return {query}
	 * 
	 * @memberOf Context	
	 */
	applyFilters(query, ctx) {
		if (ctx.params) {
			if (ctx.params.limit)
				query.limit(ctx.params.limit);

			if (ctx.params.offset)
				query.skip(ctx.params.offset);

			if (ctx.params.sort)
				query.sort(ctx.params.sort.replace(/,/, " "));
		}
		return query;
	}	

	/**
	 * Populate models by schema
	 * 
	 * @param {Context} ctx				Context
	 * @param {Array} 	docs			Models
	 * @param {Object} 	populateSchema	schema for population
	 * @returns	{Promise}
	 * 
	 * @memberOf Service
	 */
	populateModels(ctx, docs, populateSchema) {
		populateSchema = populateSchema || this.settings.modelPopulates; 
		if (docs != null && populateSchema) {
			let promises = [];
			_.forIn(populateSchema, (actionName, field) => {
				if (_.isString(actionName)) {
					let items = _.isArray(docs) ? docs : [docs];

					// Collect IDs from field of docs (flatten, compact & unique list) 
					let idList = _.uniq(_.flattenDeep(_.compact(items.map(doc => doc[field]))));
					if (idList.length > 0) {
						
						// Call the target action & collect the promises
						promises.push(ctx.call(actionName, { id: idList, resultAsObject: true, propFilter: true }).then(populatedDocs => {
							// Replace the received models with IDs in the original docs
							items.forEach(doc => {
								let id = doc[field];
								if (_.isArray(id)) {
									let models = _.compact(id.map(_id => populatedDocs[_id]));
									doc[field] = models;
								} else {
									doc[field] = populatedDocs[id];
								}
							});
						}));
					}
				}
			});

			if (promises.length > 0) {
				return Promise.all(promises).then(() => {
					return docs;
				});
			}
		}
		
		// Fallback, if no populate defined
		return Promise.resolve(docs);		
	}

	/**
	 * Resolve model(s) by ID(s) or code(s)
	 * Available context params:
	 * 		{Array|Number} 		id					ID or ID list
	 * 		{Array|String} 		code				code or codelist
	 * 		{Boolean} 			resultAsObject		if true, return an object instead of Array, and the key is the ID
	 * 		{Boolean} 			populate			populate the models
	 * 		{Boolean|String}	propFilter			run toJSON with filter. If `propFilter` is string, use it as filter
	 * 
	 * @param {Context} ctx		Context
	 * @returns
	 * 
	 * @memberOf Service
	 */
	resolveModel(ctx) {
		let filterProperties = (doc) => {
			if (ctx.params.propFilter != null) {
				let filter;
				if (_.isString(ctx.params.propFilter))
					filter = ctx.params.propFilter;
				return this.toJSON(doc, filter);
			}			
			return doc;
		};

		return Promise.resolve(ctx)

		// Get from DB by IDs or codes
		.then(ctx => {
			let id = ctx.params["id"];
			let code = ctx.params["code"];
			if (code && this.settings.hashedIdentity) {
				if (_.isFunction(this.collection.schema.methods["decodeID"])) {
					if (_.isArray(code)) {
						id = code.map(item => this.collection.schema.methods.decodeID(item));
					} else {
						id = this.collection.schema.methods.decodeID(code);
					}
				}
			}

			if (id == null || id.length == 0)
				throw new E.RequestError(E.BAD_REQUEST, C.INVALID_CODE, "app:InvalidCode");

			let query;
			if (_.isArray(id)) {
				query = this.collection.find({ _id: { $in: id} });
			} else
				query = this.collection.findById(id);

			return query.exec();
		})

		// Convert to plain JSON object
		.then(docs => {
			if (_.isArray(docs))
				return docs.map(doc => doc.toJSON());
			else if (_.isObject(docs)) 
				return docs.toJSON();
		})

		// Populate if need
		.then(docs => {
			if (ctx.params.populate === true)
				return this.populateModels(ctx, docs);

			return docs;
		})

		// Convert result to object instead of Array (if need)
		// & filter properties (if need)
		.then(docs => {
			if (_.isArray(docs) && ctx.params.resultAsObject === true) {
				let docsObj = {};
				docs.forEach(doc => docsObj[doc.id] = filterProperties(doc));

				return docsObj;
			}
			if (ctx.params.propFilter != null)
				return docs.map(doc => filterProperties(doc));

			return docs;
		});

	}
}

module.exports = Service;