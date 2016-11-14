"use strict";

let logger 			= require("./logger");
let config 			= require("../config");
let response		= require("./response");

let C 				= require("./constants");
let Sockets   		= require("./sockets");

let _ 				= require("lodash");

let Context = function(service) {
	this.service = service; // service instance
	this.io = service.io; // namespace IO
	this.app = null; // ExpressJS app
	this.req = null; // req from ExpressJS router
	this.res = null; // res from ExpressJS router
	this.action = null; // action of service
	this.t = null; // i18n translate method
	this.user = null; // logged in user
	this.socket = null; // socket from socket.io session
	this.params = []; // params from ExpressJS REST or websocket or GraphQL args
	this.model = null; // model from `modelResolvers`
	this.provider = "internal"; // `internal`, `rest`, `socket` or `graphql`

	this.validationErrors = [];
};
/*
// Initialize Context from other context
Context.from = function(ctx, service) {
	let newCtx = _.defaults(new Context(service), ctx);
	newCtx.provider = "internal";
	return newCtx;
}
*/
// Initialize Context from a REST call
Context.CreateFromREST = function(service, action, app, req, res) {
	let ctx = new Context(service);
	ctx.provider = "rest";
	ctx.app = app;
	ctx.req = req;
	ctx.res = res;
	ctx.t = req.t;
	ctx.user = req.user;
	ctx.params = _.defaults({}, req.query, req.params, req.body);
	ctx.action = action;

	return ctx;
};

// Initialize Context from a socket call
Context.CreateFromSocket = function(service, action, app, socket, data) {
	let ctx = new Context(service);
	ctx.provider = "socket";
	ctx.app = app;
	ctx.socket = socket;
	ctx.t = app.t;
	ctx.user = socket.request.user;
	ctx.params = data || {};
	ctx.action = action;

	return ctx;
};

// Initialize Context from a GraphQL query
Context.CreateFromGraphQL = function(service, action, root, args, context) {
	let ctx = new Context(service);
	ctx.provider = "graphql";
	ctx.t = context.t;
	ctx.params = args;
	ctx.user = context.user;
	ctx.action = action;

	return ctx;
};

// Initialize Context for Service.init
Context.CreateToServiceInit = function(service, app, db) {
	let ctx = new Context(service);
	ctx.provider = "";
	ctx.app = app;

	return ctx;
};

Context.prototype.resolveModel = function() {
	if (_.isFunction(this.service.modelResolver)) {
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
};

Context.prototype.checkPermission = function() {
	let permission = this.action.permission || this.service.permission || C.PERM_LOGGEDIN;

	if (permission == C.PERM_PUBLIC)
		return Promise.resolve();


	return Promise.resolve()

	// check logged in
	.then(() => {
		if (!this.user)
			this.errorUnauthorized();
	})

	// check role
	.then(() => {
		if (permission == C.PERM_ADMIN && this.user.roles.indexOf(C.ROLE_ADMIN) == -1) {
			this.errorForbidden();
		}
		else if (permission == C.PERM_USER && this.user.roles.indexOf(C.ROLE_USER) == -1) {
			this.errorForbidden();
		}
	})

	// check owner
	.then(() => {
		if (permission == C.PERM_OWNER && _.isFunction(this.service.ownerChecker)) {
			return this.service.ownerChecker(this).catch((err) => {
				this.errorForbidden(C.ERR_ONLY_OWNER_CAN_EDIT_AND_DELETE, err ? err.message || err : this.t("YouAreNotTheOwner"));
			});
		}
	});
};


// Broadcast a message 
Context.prototype.broadcast = function(cmd, data) {
	if (this.io) {
		let path = "/" + this.service.namespace + "/" + cmd;
		logger.debug("Send WS broadcast message to '" + path + "':", data);
		this.io.emit(path, data);
	}
};

// Send a message back to the requested user
Context.prototype.emitUser = function(cmd, data) {
	if (!this.socket && this.user) {
		// If not socket (come from REST), but has user, we try to find it
		this.socket = _.find(Sockets.userSockets, (socket) => { 
			return socket.request.user._id == this.user._id;
		});
	}
	if (this.socket) {
		let path = "/" + this.service.namespace + "/" + cmd;
		logger.debug("Send WS message to " + this.socket.request.user.username + " '" + path + "':", data);
		this.socket.emit(path, data);
	}
};

// Broadcast a message to a role If the `role` is not specified, we use the role of service
Context.prototype.emit = function(cmd, data, role) {
	if (!role)
		role = this.service.role;
	
	// If not definied we will send a broadcast
	if (!role) {
		let path = "/" + this.service.namespace + "/" + cmd;
		logger.debug("Send WS broadcast message to '" + path + "':", data);

		if (this.socket)
			this.socket.broadcast.emit(path, data);
		else
			this.io.emit(path, data);

		return;
	}

	if (this.io) {
		let path = "/" + this.service.namespace + "/" + cmd;
		logger.debug("Send WS message to '" + role + "' role '" + path + "':", data);

		_.each(Sockets.userSockets, (socket) => { 
			let user = socket.request.user;
			if (user && user.roles && user.roles.indexOf(role) !== -1) {
				// If requested via socket we omit the requester user
				if (this.provider == "socket" && user == this.user) return;

				logger.debug("Send WS message to " + user.username + " '" + path + "':", data);
				socket.emit(path, data);
			}
		});
	}

};

Context.prototype.validateParam = function(name, errorMessage) {
	let self = this;

	let validator = {
		name: name,
		value: null,
		errors: []
	};

	validator.noError = function() {
		return validator.errors.length == 0;
	};

	validator.addError = function(message) {
		validator.errors.push(message);
		self.validationErrors.push(message);
	};

	validator.end = function() {
		if (validator.noError())
			self.params[validator.name] = validator.value;

		return validator.value;
	};

	validator.throw = function() {
		if (!validator.noError())
			throw new Error(validator.errors.join(" "));
		
		return validator.value;
	};

	validator.notEmpty = function(errorMessage) {
		if (validator.value == null || validator.value == "")
			validator.addError(errorMessage || `Parameter '${name}' is empty!`); // i18n

		if (_.isArray(validator.value) && validator.value.length == 0)
			validator.addError(errorMessage || `Parameter '${name}' is empty!`); // i18n

		return validator;
	};

	validator.trim = function() {
		if (validator.noError() && validator.value != null)
			validator.value = validator.value.trim();
		
		return validator;
	};

	let value = this.params[name];
	if (value != null) 
		validator.value = value;
	//else
	//	validator.addError(errorMessage || `Parameter '${name}' missing!`); // i18n

	return validator;
};

Context.prototype.hasValidationErrors = function() {
	return this.validationErrors.length > 0;
};

// Generate an error response
Context.prototype.errorBadRequest = function(type, msg) {
	let err = new Error(msg);
	err = _.defaults(response.BAD_REQUEST);
	if (type)
		err.type = type;
	if (msg)
		err.message = msg;

	throw err;
};

// Generate an error response
Context.prototype.errorForbidden = function(type, msg) {
	let err = new Error(msg);
	err = _.defaults(response.FORBIDDEN);
	if (type)
		err.type = type;
	if (msg)
		err.message = msg;

	throw err;
};

// Generate an error response
Context.prototype.errorUnauthorized = function(type, msg) {
	let err = new Error(msg);
	err = _.defaults(response.UNAUTHORIZED);
	if (type)
		err.type = type;
	if (msg)
		err.message = msg;

	throw err;
};

Context.prototype.toJSON = function(docs, skipFields) {
	let func = function(doc) {
		let json = doc.toJSON();
		skipFields = ["id", "_id", "__v"].concat(skipFields || []);		
		return _.omit(json, skipFields);
	};

	if (docs == null) 
		docs = this.model;

	if (_.isArray(docs)) {
		return _.map(docs, (doc) => func(doc, skipFields));
	} else if (_.isObject(docs)) {
		return func(docs);
	}
};

/**
 * Process limit, offset and sort params from request
 * and use them in the query
 *
 * Example:
 * 	GET /posts?offset=20&limit=10&sort=-votes,createdAtR
 * 
 * @param  {query} query Mongo query object
 * @return {query}
 */
Context.prototype.queryPageSort = function(query) {
	if (this.params) {
		if (this.params.limit)
			query.limit(this.params.limit);

		if (this.params.offset)
			query.skip(this.params.offset);

		if (this.params.sort)
			query.sort(this.params.sort.replace(/,/, " "));
	}
	return query;
};

Context.prototype.isAuthenticated = function(role) {
	return this.user != null;
};

Context.prototype.hasRole = function(role) {
	return this.user && this.user.roles.indexOf(role) != -1;
};

module.exports = Context;