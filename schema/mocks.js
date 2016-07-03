"use strict";

let fakerator = require("fakerator")();

const mocks = {
	String: () => "It works!",
	Query: () => ({
		author: (root, args) => {
			return { firstName: args.firstName, lastName: args.lastName };
		}
	}),
	Author: () => ({
		firstName: () => fakerator.names.firstName,
		lastName: () => fakerator.names.lastName
	}),
	Post: () => fakerator.entity.post()
};

module.exports = mocks;
