"use strict";

class RequestError extends Error {
	constructor({ type, status, message, params }, _type, msgCode) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
		this.name = "RequestError";
		this.message = message;
		this.status = status;
		this.params = params;
		this.type = _type || type;
		this.msgCode = msgCode;
	}
}

module.exports = {
	RequestError,

	BAD_REQUEST: {
		status: 400,
		type: "BAD_REQUEST",
		message: "Invalid request"
	},

	UNAUTHORIZED: {
		status: 401,
		type: "UNAUTHORIZED",
		message: "Unauthorized. Please login first!"
	},

	REQUEST_FAILED: {
		status: 402,
		type: "REQUEST_FAILED",
		message: "Request failed!"
	},	

	FORBIDDEN: {
		status: 403,
		type: "FORBIDDEN",
		message: "You have not enough permission for this resource!"
	},

	NOT_FOUND: {
		status: 404,
		type: "NOT_FOUND",
		message: "Not found!"
	},

	TOO_MANY_REQUEST: {
		status: 429,
		type: "TOO_MANY_REQUEST",
		message: "Too many request!"
	},

	SERVER_ERROR: {
		status: 500,
		type: "SERVER_ERROR",
		message: "Server error"
	},

	NOT_IMPLEMENTED: {
		status: 501,
		type: "NOT_IMPLEMENTED",
		message: "This resource is not implemented!"
	},
	
};