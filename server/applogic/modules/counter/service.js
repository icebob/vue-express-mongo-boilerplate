"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let store 		= require("./memstore");

module.exports = {
	settings: {
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

		// Required permission for actions
		permission: C.PERM_LOGGEDIN
	},

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
		find: {
			cache: true,
			handler(ctx) {
				return Promise.resolve(store.counter);
			}
		},

		/**
		 * Set a new value to the counter
		 * 
		 *	via REST: 
		 *		POST /counter
		 *			body: { value: 123 }
		 *		
		 *		GET /counter/create?value=123
		 *		
		 *	via Websocket: 
		 *		/counter/create
		 *			data: { value: 123 }
		 *		
		 *	via GraphQL: 
		 *		mutation { countercreate(value: 123) }
		 *		
		 */		
		create(ctx) {
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
		reset: {
			// Need administration role to perform this action
			permission: C.PERM_ADMIN,

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
		 * @return {Promise}       Promise with the counter value
		 */
		changeCounter(ctx, value) {
			store.counter = value;
			logger.info(ctx.user.username + " changed the counter to ", store.counter);
			this.notifyModelChanges(ctx, "changed", store.counter);

			return Promise.resolve(store.counter);
		}
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
	 * Websocket options
	 */
	socket: {
		// Namespace of socket
		//nsp: "/counter",

		// Fired after a new socket connected
		afterConnection(socket, io) {
			//logger.info("counter afterConnection");
			
			// We sent the counter last value to the client
			socket.emit("/counter/changed", store.counter);
		}
	},

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
			counterCreate(value: Int!): Int
			counterReset: Int
			counterIncrement: Int
			counterDecrement: Int
		`,
		
		resolvers: {

			Query: {
				counter: "find",
			},

			Mutation: {
				counterCreate: "create",
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

# Save a new counter value
mutation saveCounter {
  counterCreate(value: 12)
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