"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let _ 				= require("lodash");

let Context = function(service) {
	this.service = service; // service instance
	this.app = null; // ExpressJS app
	this.req = null; // req from ExpressJS router
	this.res = null; // res from ExpressJS router
	this.user = null; // logged in user
	this.socket = null; // socket from socket.io session
	this.io = null; // namespace IO
	this.params = []; // params from ExpressJS REST or websocket or GraphQL args
	this.model = null; // model from `modelResolvers`
	this.provider = "direct" // `direct`, `rest`, `socket` or `graphql`
	this.actions = {} // actions from service (bind ctx parameter)

	if (service.actions) {
		_.forIn(service.actions, (action, name) => {
			this.actions[name] = () => {
				return action.apply(service, [].concat([this], arguments));
			}
		})
	}
}

// Initialize Context from a REST call
Context.CreateFromREST = function(service, app, req, res) {
	let ctx = new Context(service);
	ctx.provider = "rest";
	ctx.app = app;
	ctx.io = app.io;
	ctx.req = req;
	ctx.res = res;
	ctx.user = req.user;
	ctx.params = _.defaults({}, req.query, req.params);

	return ctx;
}

// Initialize Context from a socket call
Context.CreateFromSocket = function(service, io, socket, cmd, data) {
	let ctx = new Context(service);
	ctx.provider = "socket";

	return ctx;
}

// Initialize Context from a GraphQL query
Context.CreateFromGraphQL = function(service, name, root, args, context) {
	let ctx = new Context(service);
	ctx.provider = "graphql";

	return ctx;
}

// Initialize Context for Service.init
Context.CreateToServiceInit = function(service, app, db) {
	let ctx = new Context(service);
	ctx.provider = "";
	ctx.app = app;
	ctx.io = app.io;

	return ctx;
}

// Broadcast a message 
Context.prototype.broadcast = function(msg, data) {
	let path = this.service.namespace + "/" + msg;
	logger.info("Send broadcast message to `" + path + "`:", data);
}

// Send a message to me
Context.prototype.emitUser = function(msg, data) {
	let path = this.service.namespace + "/" + msg;

}

// Broadcast a message to a role
Context.prototype.emitRole = function(role, msg, data) {
	let path = this.service.namespace + "/" + msg;

}

// Generate an error response
Context.prototype.errorBadRequest = function(msg) {
	let err = new Error(msg);
	err.status = 400;

	throw err;
}

module.exports = Context;