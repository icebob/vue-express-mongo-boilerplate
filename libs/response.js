"use strict";

module.exports = {
	
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

	NOT_FOUND: {
		status: 404,
		type: "NOT_FOUND",
		message: "Not found!"
	},

	SERVER_ERROR: {
		status: 500,
		type: "SERVER_ERROR",
		message: "Server error"
	},

	json(res, data, err, errMessage) {
		let response = {};

		if (err) {
			response.error = err;
			response.status = err.status || 500;
			if (errMessage)
				response.error.message = errMessage

			return res.status(response.status).json(response);
		}

		response.status = 200;
		response.data = data;

		return res.json(response);
	}

}