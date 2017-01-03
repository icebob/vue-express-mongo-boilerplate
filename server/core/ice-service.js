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

				// You can call the `model` action with
				// 		GET /api/{service}/?id=123 
				// 	or 
				// 		GET /api/{service}/123
				case "model": {
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
			let json = doc.toJSON();
			if (propFilter != null)
				return _.pick(json, propFilter);
			else
				return json;
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
					let idList = _.uniq(items.map(doc => doc[field]));
					if (idList.length > 0) {
						// TODO $resultAsObject implement
						/*
							posts.resolve action is legyen
							Paraméterei: id, code (list vagy érték)
							Egyéb:
								resolveAsObject: true // objektumot ad vissza, aho la kulcs az azonosító amit kapott
								populate: true // populate-et hajtsa végre
								propFilter: true vagy "" // ha true, akkor csinálja a default prop filtert. 
									Ha string vagy array, akkor azt használja prop filternek
						*/

						promises.push(ctx.call(actionName, { id: idList, $resultAsObject: true }).then(populatedDocs => {
							items.forEach(doc => {
								let popDoc = _.find(populatedDocs, p => p.id == doc[field]);
								if (popDoc)
									doc[field] = popDoc;
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
		return Promise.resolve(docs);		
	}

	resolveModel(ctx) {
		return Promise.resolve(ctx)
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
		.then(docs => {
			if (_.isArray(docs))
				return docs.map(doc => doc.toJSON());
			else if (_.isObject(docs)) 
				return docs.toJSON();
		});		
	}
}

module.exports = Service;