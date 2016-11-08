"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let Sockets   		= require("./sockets");

let _ 				= require("lodash");

let Context = function(service) {
	this.service = service; // service instance
	this.app = null; // ExpressJS app
	this.req = null; // req from ExpressJS router
	this.res = null; // res from ExpressJS router
	this.t = null; // i18n translate method
	this.user = null; // logged in user
	this.socket = null; // socket from socket.io session
	this.io = null; // namespace IO
	this.params = []; // params from ExpressJS REST or websocket or GraphQL args
	this.model = null; // model from `modelResolvers`
	this.provider = "direct" // `direct`, `rest`, `socket` or `graphql`
	/*this.actions = {} // actions from service (bind ctx parameter)

	if (service.actions) {
		_.forIn(service.actions, (action, name) => {
			this.actions[name] = () => {
				return action.apply(service, [].concat([this], arguments));
			}
		})
	}*/

	this.validationErrors = [];
}

// Initialize Context from a REST call
Context.CreateFromREST = function(service, app, req, res) {
	let ctx = new Context(service);
	ctx.provider = "rest";
	ctx.app = app;
	ctx.io = service.io;
	ctx.req = req;
	ctx.res = res;
	ctx.t = req.t;
	ctx.user = req.user;
	ctx.params = _.defaults({}, req.query, req.params, req.body);

	return ctx;
}

// Initialize Context from a socket call
Context.CreateFromSocket = function(service, app, socket, cmd, data) {
	let ctx = new Context(service);
	ctx.provider = "socket";
	ctx.app = app;
	ctx.io = service.io;
	ctx.socket = socket;
	ctx.t = app.t;
	ctx.user = socket.request.user
	ctx.params = data || {};
	logger.info(ctx.params);

	return ctx;
}

// Initialize Context from a GraphQL query
Context.CreateFromGraphQL = function(service, root, args, context) {
	let ctx = new Context(service);
	ctx.provider = "graphql";
	ctx.t = service.app.t;
	ctx.params = args;
	ctx.user = context.user;
	ctx.io = service.io;

	return ctx;
}

// Initialize Context for Service.init
Context.CreateToServiceInit = function(service, app, db) {
	let ctx = new Context(service);
	ctx.provider = "";
	ctx.app = app;

	return ctx;
}

Context.prototype.resolveModel = function() {
	if (this.service.model && _.isFunction(this.service.modelResolver)) {
		let idParamName = this.service.idParamName || "id";

		let id = this.params[idParamName];

		if (id != null) {
			return this.service.modelResolver(this, id).then( (model) => {
				this.model = model;
				return model;
			});
		}
	}

	return Promise.resolve(null);
}

// Broadcast a message 
Context.prototype.broadcast = function(cmd, data) {
	if (this.io) {
		let path = "/" + this.service.namespace + "/" + cmd;
		logger.debug("Send WS broadcast message to '" + path + "':", data);
		this.io.emit(path, data);
	}
}

// Send a message back to socket
Context.prototype.emitUser = function(cmd, data) {
	if (!this.socket && this.user) {
		// If not socket (come from REST), but has user, we try to find it
		this.socket = _.find(Sockets.userSockets, (socket) => { 
			return socket.request.user._id == this.user._id
		});
	}
	if (this.socket) {
		let path = "/" + this.service.namespace + "/" + cmd;
		logger.debug("Send WS message to " + this.socket.request.user.username + " '" + path + "':", data);
		this.socket.emit(path, data);
	}
}

// Broadcast a message to a role If the `role` is not specified, we use the role of service
Context.prototype.emit = function(cmd, data, role) {
	if (!role)
		role = this.service.role;
	
	// If not definied we will send a broadcast
	if (!role) {
		return this.broadcast(cmd, data);
	}

	if (this.io) {
		let path = "/" + this.service.namespace + "/" + cmd;
		logger.debug("Send WS message to '" + role + "' role '" + path + "':", data);

		_.each(Sockets.userSockets, (socket) => { 
			let user = socket.request.user;
			if (user && user.roles && user.roles.indexOf(role) !== -1) 
				logger.debug("Send WS message to " + user.username + " '" + path + "':", data);
				socket.emit(path, data);
		});
	}

}

Context.prototype.validateParam = function(name, errorMessage) {
	let self = this;

	let validator = {
		name: name,
		value: null,
		errors: []
	};

	validator.noError = function() {
		return validator.errors.length == 0;
	}

	validator.addError = function(message) {
		validator.errors.push(message);
		self.validationErrors.push(message);
	}

	validator.end = function() {
		if (validator.noError())
			self.params[validator.name] = validator.value;

		return validator.value;
	}

	validator.throw = function() {
		if (!validator.noError())
			throw new Error(validator.errors.join(" "));
		
		return validator.value;
	}	

	validator.notEmpty = function(errorMessage) {
		if (validator.value == null || validator.value == "")
			validator.addError(errorMessage || `Parameter '${name}' is empty!`); // i18n

		if (_.isArray(validator.value) && validator.value.length == 0)
			validator.addError(errorMessage || `Parameter '${name}' is empty!`); // i18n

		return validator;
	}

	validator.trim = function() {
		if (validator.noError())
			validator.value = validator.value.trim();
		
		return validator;
	}

	let value = this.params[name];
	if (value != null) 
		validator.value = value;
	else
		validator.addError(errorMessage || `Parameter '${name}' missing!`); // i18n

	return validator;
}

Context.prototype.hasValidationErrors = function() {
	return this.validationErrors.length > 0;
}

// Generate an error response
Context.prototype.errorBadRequest = function(msg) {
	let err = new Error(msg);
	err.status = 400;

	throw err;
}

module.exports = Context;