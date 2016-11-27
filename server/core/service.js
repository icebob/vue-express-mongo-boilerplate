"use strict";

let logger 		= require("./logger");
let config 		= require("../config");
let Sockets		= require("./sockets");
let C 	 		= require("./constants");

let _			= require("lodash");
let hash		= require("object-hash");
let Cacher		= require("./cacher");
let Services;

let warn = function(msg) {
	logger.warn("[Service warn]: " + msg);
};

let exception = function(msg) {
	throw new Error("[Service warn]: " + msg);
};

class Service {

	/**
	 * Creates an instance of Service.
	 * 
	 * @param {any} schema
	 * @param {any} app
	 * @param {any} db
	 * 
	 * @memberOf Service
	 */
	constructor(schema, app, db) {
		let self = this;
		schema = schema || {};
		self.$schema = schema; 
		self.$app = app;
		self.$db = db;

		if (!Services) 
			Services = require("./services");		

		if (!schema.settings)
			exception(`No settings of service '${self.name}'! Please create a settings object in service schema!`);

		let settings = _.defaultsDeep(schema.settings, {
			version: 1,
			namespace: "",
			internal: false,
			rest: false,
			ws: false,
			graphql: false,
			permission: C.PERM_LOGGEDIN,
			role: C.ROLE_USER,
			idParamName: "code", // GET /users/find?code=bD6kd
			modelPropFilter: null
		});
		self.$settings = settings;

		// Common properties
		self.name = settings.name;
		self.version = settings.version;
		self.namespace = settings.namespace;
		self.collection = settings.collection;

		// Assert properties
		if (!self.name)
			exception(`No name of service '${self.name}'! Please set in settings of service schema!`);

		if (!self.namespace && (settings.rest || settings.ws || settings.graphql))
			exception(`No namespace of service '${self.name}'! Please set in settings of service schema!`);	


		// Handle caching option
		if (config.cacheTimeout) {
			let cacheType = config.redis.enabled ? "redis" : "memory";
			self.$cacher = new Cacher(cacheType, self.name, config.cacheTimeout);
			//self.$cacher.clean();
		}
		
		// Wrap the handler function to implement caching feature
		let cachingWrapper = function(action, handler) {
			return function(ctx) {
				let cacheKey = self.getCacheKey(action.name, ctx.params);

				return self.getFromCache(cacheKey)
				.then((cachedJSON) => {
					if (cachedJSON != null) {
						// Found in the cache!
						return cachedJSON;
					}

					return handler(ctx).then((json) => {
						self.putToCache(cacheKey, json);
						return json;
					});					
				});
			};
		};

		// Handle actions
		if (schema.actions && _.isObject(schema.actions)) {
			self.actions = {};
			_.forIn(schema.actions, (action, name) => {
				if (_.isFunction(action)) {
					// Change action function to action object
					action = {
						handler: action,
						name: name
					};
				}

				if (_.isFunction(action.handler)) {
					let func = action.handler.bind(self);
					if (action.cache)
						func = cachingWrapper(action, func);

					self.actions[name] = func;
				}
				self.actions[name].settings = action;
				self.actions[name].settings.name = self.actions[name].settings.name || name;
				delete self.actions[name].settings.handler;

			});
		}

		// Handle methods
		if (schema.methods && _.isObject(schema.methods)) {
			_.forIn(schema.methods, (method, name) => {
				if (["name", "version", "namespace", "collection", "actions"].indexOf(name) != -1) {
					warn(`Invalid method name '${name}' in '${self.name}' service! Skipping...`);
					return;
				}
				if (["toJSON", "getByID", "modelResolver"].indexOf(name) != -1) {
					warn(`This method name '${name}' is prohibited under 'methods' object. If you want to override the built-in method, please declare in the root of service schema! Skipping...`);
					return;
				}
				self[name] = method.bind(self);
			});
		}

		// Handle internal methods overrides
		let internalMethods = ["toJSON", "getByID", "modelResolver"];
		internalMethods.forEach((name) => {
			if (_.isFunction(schema[name])) {
				// Save the original function
				self["__" + name] = self[name];
				// Override
				self[name] = schema[name].bind(self);
			}
		});
	}

	/**
	 * Convert the `docs` MongoDB model to JSON object.
	 * With `skipFields` can be filter the properties
	 * 
	 * @param {any} 	docs		MongoDB document(s)
	 * @param {String} 	propFilter	Filter properties of model. It is a space-separated `String` or an `Array`
	 * @returns						JSON object/array
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
			propFilter = this.$settings.modelPropFilter;
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
	 * Populate models by schema
	 * 
	 * @param {any} docs			Models
	 * @param {any} populateSchema	schema for population
	 * @returns	{Promise}
	 * 
	 * @memberOf Service
	 */
	populateModels(docs, populateSchema) {
		populateSchema = populateSchema || this.$settings.modelPopulates; 
		if (docs != null && populateSchema) {
			let promises = [];
			_.forIn(populateSchema, (serviceName, field) => {
				if (_.isString(serviceName)) {
					let service = Services.get(serviceName);
					if (service && _.isFunction(service["getByID"])) {
						let items = _.isArray(docs) ? docs : [docs]; 
						items.forEach((doc) => {
							promises.push(service.getByID(doc[field]).then((populated) => {
								doc[field] = populated;
							}));
						});
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

	/**
	 * Get model(s) by ID(s). The `id` can be a number or an array with IDs.
	 * 
	 * @param {Number|Array} id
	 * @returns {Object|Array} JSON object(s)
	 */
	getByID(id) {
		if (this.collection == null || id == null)
			return Promise.resolve();

		if (_.isArray(id) && id.length == 0)
			return Promise.resolve([]);

		let cacheKey = config.cacheTimeout ? this.getCacheKey("model", id) : null;

		return Promise.resolve().then(() => {
			// Try to read from cache
			if (cacheKey)
				return this.getFromCache(cacheKey);
			else
				return null;				
		})
		.then((data) => {
			if (data)
				return data;
			
			let query;
			if (_.isArray(id)) {
				query = this.collection.find({ _id: { $in: id} });
			} else
				query = this.collection.findById(id);

			return query.exec().then((docs) => {
				return this.toJSON(docs);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				// Save to cache
				if (cacheKey)
					this.putToCache(cacheKey, json);

				return json;
			});
		});			
	}	

	/**
	 * Resolve model by `code` param
	 * 
	 * @param {any} ctx		Context of request
	 * @param {any} code	Code of the model
	 * @returns	{Promise}
	 */	
	modelResolver(ctx, code) {
		if (this.collection == null)
			return Promise.resolve();

		let id;
		if (_.isFunction(this.collection.schema.methods["decodeID"]))
			id = this.collection.schema.methods.decodeID(code);
		else
			id = code;

		ctx.modelID = id;

		if (id == null || id == "")
			return ctx.errorBadRequest(C.ERR_INVALID_CODE, ctx.t("app:InvalidCode"));

		return this.getByID(id);
	}

	/**
	 * Decode `code` value to `ID`
	 * 
	 * @param {any} code
	 * @returns {String} id
	 * 
	 * @memberOf Service
	 */
	decodeID(code) {
		if (_.isFunction(this.collection.schema.methods["decodeID"]))
			return this.collection.schema.methods.decodeID(code);
		throw new Error(`'decodeID' method not implemented in '${this.name}' service!`);		
	}

	/**
	 * Encode `id` to `code` value
	 * 
	 * @param {any} id
	 * @returns {String} code
	 * 
	 * @memberOf Service
	 */
	encodeID(id) {
		if (_.isFunction(this.collection.schema.methods["encodeID"]))
			return this.collection.schema.methods.encodeID(id);
		throw new Error(`'encodeID' method not implemented in '${this.name}' service!`);		
	}

	/**
	 * Generate a cache key for caching from action name & hashed parameters
	 * E.g: 
	 * 		find:8de264844d01ab32078eb71762fdfda646a15cb4
	 * 
	 * @param {any} name	name of action
	 * @param {any} params	params of request
	 * @returns	{String} 	hashed key
	 */
	getCacheKey(name, params) {
		return (name ? name + ":" : "") + (params ? hash(params) : "");
	}

	/**
	 * Get a result from cache by `key` 
	 * 
	 * @param {any} key
	 * @returns {Promise}
	 */
	getFromCache(key) {
		if (this.$cacher) {
			return this.$cacher.get(key);
		} else 
			return Promise.resolve(null); 
	}

	/**
	 * Put the result to the cache by `key`
	 * 
	 * @param {any} key
	 * @param {any} data
	 * @returns
	 */
	putToCache(key, data) {
		if (this.$cacher) {
			return this.$cacher.set(key, data);
		} else 
			return Promise.resolve(); 
	}

	/**
	 * Clear all cached items for this service
	 */
	clearCache() {
		if (this.$cacher) {
			return this.$cacher.clean();
		} 
		return Promise.resolve();
	}	

	/**
	 * Notificate the connected users if the model changed
	 * 
	 * @param {any} ctx		Request context
	 * @param {any} type	Type of changes (created, updated, deleted...etc)
	 * @param {any} json	JSON payload
	 * 
	 * @memberOf Service
	 */
	notifyModelChanges(ctx, type, json) {
		// Send notification via socket
		ctx.notifyChanges(type, json, this.$settings.role);

		Services.emit(this.name + ":" + type, { ctx: ctx, payload: json });

		// Clear cached values
		this.clearCache();
	}		

	/**
	 * Get a service by name of service
	 * 
	 * @param {any} serviceName
	 * @returns {Service}
	 * 
	 * @memberOf Service	
	 */
	services(serviceName) {
		return Services.get(serviceName);
	}

}

module.exports = Service;