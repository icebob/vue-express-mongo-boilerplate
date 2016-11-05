"use strict";

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
	this.actions = {} // actions from service (bind ctx parameter)
	this.provider = "" // `rest`, `socket` or `graphql`
}

// Initialize Context from a REST call
Context.prototype.InitFromREST(app, req, res) {
	this.provider = "rest";
}

// Initialize Context from a socket call
Context.prototype.InitFromSocket(io, socket, cmd, data) {
	this.provider = "socket";

}

// Initialize Context from a GraphQL query
Context.prototype.InitFromGraphQL(name, root, args, context) {
	this.provider = "graphql";
}

// Broadcast a message 
Context.prototype.emitBC(msg, data) {

}

// Send a message to me
Context.prototype.emitUser(msg, data) {

}

// Broadcast a message to a role
Context.prototype.emitRole(msg, data) {

}

// Generate an error response
Context.prototype.errorBadRequest(msg) {
	let err = new Error(msg);
	err.status = 400;

	return err;
}

module.exports = Context;