"use strict";

let logger 		= require("./logger");
let config 		= require("../config");
let Sockets		= require("./sockets");
let C 	 		= require("./constants");

let _			= require("lodash");
let hash		= require("object-hash");

module.exports = {
	// Name of service
	name: "",

	// Version (for versioned API)
	version: 1,

	// Namespace for rest and websocket requests
	namespace: "",

	// Enable calling via REST
	rest: true,

	// Enable calling via websocket
	ws: true,

	// Required permission for actions
	permission: C.PERM_PUBLIC,

	model: null,

	idParamName: "code", // GET /users/find?code=bD6kd

	// Cacher instance
	cacher: null,

	// Express application instance
	app: null,

	// DB handler instance
	db: null,

	// Actions of service
	actions: {
	},

	/**
	 * Initialize this service. It will be called when server load this service.
	 * The `ctx` contains the references of `app` and `db`
	 * @param  {Context} ctx   Context of initialization
	 */
	init(ctx) {
		// Call when start the service
		//logger.info("Initialize counter service!");
	},

	/**
	 * Generate a hash key for caching from action name & params
	 * 
	 * @param {any} name	name of action
	 * @param {any} params	params of request
	 * @returns	{String} 	hashed key
	 */
	getCacheKey(name, params) {
		return (name ? name + ":" : "") + (params ? hash(params) : "");
	},

	/**
	 * Get a result from cache by `key` 
	 * 
	 * @param {any} key
	 * @returns {Promise}
	 */
	getFromCache(key) {
		if (this.cacher) {
			return this.cacher.get(key);
		} else 
			return Promise.resolve(null); 
	},

	/**
	 * Put the result to the cache by `key`
	 * 
	 * @param {any} key
	 * @param {any} data
	 * @returns
	 */
	putToCache(key, data) {
		if (this.cacher) {
			this.cacher.set(key, data);
			return Promise.resolve();
		} else 
			return Promise.resolve(); 
	},

	/**
	 * Clear all cached items for this service
	 */
	clearCache() {
		if (this.cacher) {
			this.cacher.clean();
		} 
	},	

	/**
	 * Resolve model by `code` param
	 * 
	 * @param {any} ctx		Context of request
	 * @param {any} code	Code of the model
	 * @returns	{Promise}
	 */		
	modelResolver(ctx, code) {
		return null;		
	},

	/**
	 * Notificate the connected users
	 * @param  {Context} ctx   Context of request
	 */
	notifyChanged(ctx, type, json) {
		// Send notification via socket
		// ctx.notifyChanges(type, json, "user");

		// Clear cached values
		this.clearCache();
	},		

	/**
	 * Websocket options
	 */
	/*
	socket: {
		// Namespace of socket
		//nsp: "/module",

		// Fired after a new socket connected
		afterConnection(socket, io) {
		}
	},
	*/

	/**
	 * Define GraphQL queries, types, mutations. 
	 * This definitions enable to access this service via graphql
	 */
	/*
	graphql: {

		query: "",

		types: "",

		mutation: "",

		resolvers: {
		}
	}
	*/
};
