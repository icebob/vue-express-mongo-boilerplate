"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");
let E 			= require("../../../core/errors");

let store 		= require("./memstore");

module.exports = {
	// Name of service
	name: "counter",

	// Version (for versioned API)
	version: 1,

	// Additional settings of service
	settings: {

		// Is it the latest version of service? If yes, will be publish without version number too `/api/counter/get`
		latestVersion: true,

		// Namespace for rest and websocket requests (if not definied, will be used the name of service)
		// namespace: "counter",

		// Enable calling via REST
		rest: true,

		// Enable calling via websocket
		ws: true,

		// Enable calling via GraphQL
		graphql: true,

		// Default required permission to invoke actions
		permission: C.PERM_LOGGEDIN,

		// Default required role to invoke actions
		role: C.ROLE_USER
	},

	// Actions of service
	actions: {
		/**
		 * 	Get the value of the counter.
		 * 	
		 *	via REST: 
		 *		GET /counter
		 *		GET /counter/get
		 *		
		 *	via Websocket: 
		 *		/counter/get
		 *		
		 *	via GraphQL: 
		 *		query { counter }
		 */
		get: {
			// Enable caching the response
			cache: true,

			// Set this action as the default action for "GET" HTTP method
			// 		GET /api/counter
			defaultMethod: "get",

			handler(ctx) {
				return store.counter;
			}
		},

		/**
		 * Set a new value to the counter
		 * 
		 *	via REST: 
		 *		POST /counter
		 *			body: { value: 123 }
		 *		
		 *		GET /counter/set?value=123
		 *		
		 *	via Websocket: 
		 *		/counter/set
		 *			data: { value: 123 }
		 *		
		 *	via GraphQL: 
		 *		mutation { counterSet(value: 123) }
		 *		
		 */		
		set: {
			// Set this action as the default action for "POST" HTTP method
			// 		POST /api/counter
			defaultMethod: "post",

			handler(ctx) {
				if (ctx.params.value) {
					return this.changeCounter(ctx, parseInt(ctx.params.value));
				} else {
					throw new E.RequestError(E.BAD_REQUEST, C.MODEL_NOT_FOUND, "Missing value from request!");
				}
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
		reset: {
			// Need administration role to perform this action
			permission: C.PERM_ADMIN,

			// Set this action as the default action for "DELETE" HTTP method
			// 		DELETE /api/counter
			defaultMethod: "delete",

			// Handler
			handler(ctx) {
				return this.changeCounter(ctx, 0);
			}
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

	methods: {
		/**
		 * Change the counter value
		 * @param  {Context} ctx   Context of request
		 * @param  {Number} value  New value
		 * @return {Number}        Value of counter
		 */
		changeCounter(ctx, value) {
			store.counter = value;
			logger.info(ctx.params.$user.username + " changed the counter to ", store.counter);
			//this.notifyModelChanges(ctx, "changed", store.counter);

			return store.counter;
		}
	},
	
	/**
	 * Websocket options
	 *
	socket: {
		// Namespace of socket
		//nsp: "/counter",

		// Fired after a new socket connected
		afterConnection(socket, io) {
			//logger.info("counter afterConnection");
			
			// We sent the counter last value to the client
			socket.emit("/counter/changed", store.counter);
		}
	},*/

	/**
	 * Define GraphQL queries, types, mutations. 
	 * This definitions enable to access this service via graphql
	 */
	graphql: {
		query: `
			counter: Int
		`,

		types: "",

		mutation: `
			counterSet(value: Int!): Int
			counterReset: Int
			counterIncrement: Int
			counterDecrement: Int
		`,
		
		resolvers: {

			Query: {
				counter: "get",
			},

			Mutation: {
				counterSet: "set",
				counterReset: "reset",
				counterIncrement: "increment",
				counterDecrement: "decrement"
			}
		}
	}

};


/*
## GraphiQL test ##

# Get value of counter
query getCounter {
  counter
}

# Set a new counter value
mutation setCounter {
  counterSet(value: 12)
}

# Reset the counter
mutation resetCounter {
  counterReset
}

# Increment the counter
mutation incrementCounter {
  counterIncrement
}

# Decrement the counter
mutation decrementCounter {
  counterDecrement
}


*/