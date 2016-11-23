"use strict";

let logger 		= require("./logger");
let config 		= require("../config");
let Sockets		= require("./sockets");
let C 	 		= require("./constants");

let _			= require("lodash");
let hash		= require("object-hash");
let Cacher		= require("./cacher");

let warn = function(msg) {
	logger.warn("[Service warn]: " + msg);
};

let exception = function(msg) {
	throw new Error("[Service warn]: " + msg);
};

class Service {
	constructor(schema, app, db) {
		let self = this;
		schema = schema || {};
		self.$schema = schema; 

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
			idParamName: "code" // GET /users/find?code=bD6kd
		});
		self.$settings = settings;

		self.name = settings.name;
		self.version = settings.version;
		self.namespace = settings.namespace;
		self.model = settings.model;

		if (!self.name)
			exception(`No name of service '${self.name}'! Please set in settings of service schema!`);
		//if (!settings.self.namespace)
		//	exception(`No namespace of service '${self.name}'! Please set in settings of service schema!`);	

		self.$app = app;
		self.$db = db;

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
			}
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
				if (["name", "version", "namespace", "model", "actions"].indexOf(name) != -1) {
					warn(`Invalid method name '${name}' in '${self.name}' service! Skipping...`);
					return;
				}
				self[name] = method.bind(self);
			});
		}
	}

	/**
	 * Generate a hash key for caching from action name & params
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
			this.$cacher.set(key, data);
			return Promise.resolve();
		} else 
			return Promise.resolve(); 
	}

	/**
	 * Clear all cached items for this service
	 */
	clearCache() {
		if (this.$cacher) {
			this.$cacher.clean();
		} 
	}	

	/**
	 * Notificate the connected users if the model changed
	 * @param  {Context} ctx   Context of request
	 */
	notifyModelChanges(ctx, type, json) {
		// Send notification via socket
		ctx.notifyChanges(type, json, this.$settings.role);

		// Clear cached values
		this.clearCache();
	}		

}

module.exports = Service;