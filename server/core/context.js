"use strict";

let Context = function() {
	this.req = null; // req from ExpressJS router
	this.res = null; // res from ExpressJS router
	this.user = null; // logged in user
	this.socket = null; // socket from socket.io session
	this.io = null; // namespace IO
	this.params = []; // params from ExpressJS REST or websocket or GraphQL args
	this.model = null; // model from `modelResolvers`
	this.service = null; // service instance
	this.actions = {} // actions from service
	this.reqType = "rest" // `rest`, `socket` or `graphql`

	this.errorBadRequest(msg) {
		let err = new Error(msg);
		err.status = 400;

		return err;
	}
}

// Broadcast a message 
Context.prototype.emit(msg, data) {

}


module.exports = Context;