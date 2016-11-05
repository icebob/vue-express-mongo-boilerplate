"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let store 			= require("./memstore");

module.exports = {

	version: 1,
	namespace: "/counter",
	rest: true,
	socket: true,
	graphql: true,
	needAuthenticated: true,
	roles: ["user"]

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
				store.counter = ctx.params.value;
				ctx.actions.notifyChanged();
			}
		},

		// You can call it 
		// 	via REST: /counter/increment
		// 	via socket: /counter/increment
		// 	via graphQL: CounterIncrement (generated from path + functionName)
		increment(ctx) {
			store.counter++;
			logger.info(socket.request.user.username + " increment the counter to ", store.counter);
			ctx.actions.notifyChanged();
		},

		// You can call it 
		// 	via REST: /counter/decrement
		// 	via socket: /counter/decrement
		// 	via graphQL: CounterDecrement (generated from path + functionName)
		decrement(ctx) {
			store.counter++;
			logger.info(socket.request.user.username + " decrement the counter to ", store.counter);
			ctx.actions.notifyChanged();
		},

		notifyChanged(ctx) {
			ctx.emit("counter", store.counter);	
		}
	},

	init(ctx) {
		// Call when start the service
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