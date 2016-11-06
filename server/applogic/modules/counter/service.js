"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let store 			= require("./memstore");

module.exports = {
	name: "counter",
	version: 1,
	namespace: "/counter",
	rest: true,
	socket: true,
	graphql: true,
	//role: "user",

	actions: {
		// You can call it 
		// 	via REST: /counter
		// 	via socket: /counter
		// 	via graphQL: Counter
		find(ctx) {
			return Promise.resolve(store.counter);
		},

		// You can call it 
		// 	via REST: /counter/save
		// 	via socket: /counter/save
		// 	via graphQL: CounterSave (generated from path + functionName)
		save(ctx) {
			if (ctx.params.value) {
				store.counter = parseInt(ctx.params.value);
				ctx.actions.notifyChanged();
				return Promise.resolve(store.counter);
			} else {
				throw new Error("Missing value from request!");
			}
		},

		// You can call it 
		// 	via REST: /counter/reset
		// 	via socket: /counter/reset
		// 	via graphQL: CounterReset (generated from path + functionName)
		reset(ctx) {
			store.counter = 0;
			ctx.actions.notifyChanged();
			return Promise.resolve(store.counter);
		},		

		// You can call it 
		// 	via REST: /counter/increment
		// 	via socket: /counter/increment
		// 	via graphQL: CounterIncrement (generated from path + functionName)
		increment(ctx) {
			store.counter++;
			//logger.info(ctx.user.username + " increment the counter to ", store.counter);
			ctx.actions.notifyChanged();

			return Promise.resolve(store.counter);
		},

		// You can call it 
		// 	via REST: /counter/decrement
		// 	via socket: /counter/decrement
		// 	via graphQL: CounterDecrement (generated from path + functionName)
		decrement(ctx) {
			store.counter++;
			//logger.info(ctx.user.username + " decrement the counter to ", store.counter);
			ctx.actions.notifyChanged();

			return Promise.resolve(store.counter);
		},

		notifyChanged(ctx) {
			ctx.broadcast("changed", store.counter);	
		}
	},

	init(ctx) {
		// Call when start the service
		logger.info("Initialize counter service!");
	},

	socket: {
		afterConnection(socket, io) {
			socket.emit("/counter", store.counter);
		}
	},

	graphql: {
		query: ``,
		types: ``,
		mutations: ``,
		resolvers: {
			// Generated from actions
		}
	}

};