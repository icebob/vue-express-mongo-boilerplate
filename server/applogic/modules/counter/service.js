"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let store 			= require("./memstore");

module.exports = {

	// Name of service
	name: "counter",

	// Version (for versioned API)
	version: 1,

	// Namespace for rest and websocket requests
	namespace: "counter",

	// Enable calling via REST
	rest: true,

	// Enable calling via websocket
	ws: true,

	// Enable calling via GraphQL
	graphql: true,

	// Required role for calling
	role: "user",

	// Actions of service
	actions: {
		/**
		 * 	Get the value of the counter.
		 * 	
		 *	via REST: 
		 *		GET /counter
		 *		GET /counter/find
		 *		
		 *	via Websocket: 
		 *		/counter/find
		 *		
		 *	via GraphQL: 
		 *		query { counter }
		 */
		find(ctx) {
			return Promise.resolve(store.counter);
		},

		/**
		 * Set a new value to the counter
		 * 
		 *	via REST: 
		 *		POST /counter
		 *			body: { value: 123 }
		 *		
		 *		GET /counter/save?value=123
		 *		
		 *	via Websocket: 
		 *		/counter/save
		 *			data: { value: 123 }
		 *		
		 *	via GraphQL: 
		 *		mutation { counterSave(value: 123) }
		 *		
		 */		
		save(ctx) {
			if (ctx.params.value) {
				return this.changeCounter(ctx, parseInt(ctx.params.value));
			} else {
				throw new Error("Missing value from request!");
			}
		},

		/**
		 * Reset the counter
		 * 
		 *	via REST: 
		 *		GET /counter/reset
		 *		
		 *	via Websocket: 
		 *		/counter/reset
		 *		
		 *	via GraphQL: 
		 *		mutation { counterReset }
		 */
		reset(ctx) {
			return this.changeCounter(ctx, 0);
		},		

		/**
		 * Increment the counter
		 * 
		 *	via REST: 
		 *		GET /counter/increment
		 *		
		 *	via Websocket: 
		 *		/counter/increment
		 *		
		 *	via GraphQL: 
		 *		mutation { counterIncrement }
		 */
		increment(ctx) {
			return this.changeCounter(ctx, store.counter + 1);
		},

		/**
		 * Decrement the counter
		 * 
		 *	via REST: 
		 *		GET /counter/decrement
		 *		
		 *	via Websocket: 
		 *		/counter/decrement
		 *		
		 *	via GraphQL: 
		 *		mutation { counterDecrement }
		 */
		decrement(ctx) {
			return this.changeCounter(ctx, store.counter - 1);
		}

	},

	/**
	 * Change the counter value
	 * @param  {Context} ctx   Context of request
	 * @param  {Number} value  New value
	 * @return {Promise}       Promise with the counter value
	 */
	changeCounter(ctx, value) {
		store.counter = value;
		logger.info(ctx.user.username + " changed the counter to ", store.counter);
		this.notifyChanged(ctx);

		return Promise.resolve(store.counter);
	},

	/**
	 * Notificate the connected users
	 * @param  {Context} ctx   Context of request
	 */
	notifyChanged(ctx) {
		// Send message to everyone
		ctx.broadcast("changed", store.counter);	
		
		// Send message to the requested user
		ctx.emitUser("changed", store.counter);	

		// Send message to the role of service ('user')
		ctx.emit("changed", store.counter);	
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

	socket: {
		// Namespace of socket
		ns: "/",

		// Fired after a new socket connected
		afterConnection(socket, io) {
			//logger.info("counter afterConnection");
			
			// We sent the counter last value to the client
			socket.emit("/counter/changed", store.counter);
		}
	},

	graphql: {
		query: `
			counter: Int
		`,

		types: ``,

		mutation: `
			counterSave(value: Int!): Int
			counterReset: Int
			counterIncrement: Int
			counterDecrement: Int
		`,
		
		resolvers: {

			Query: {
				counter: "find",
			},

			Mutation: {
				counterSave: "save",
				counterReset: "reset",
				counterIncrement: "increment",
				counterDecrement: "decrement"
			}
		}
	}

};