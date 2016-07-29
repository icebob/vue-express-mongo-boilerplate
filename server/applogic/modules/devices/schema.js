"use strict";

let ROOT 			= "../../../";

let logger 			= require(ROOT + "core/logger");
let config 			= require(ROOT + "config");

//let moduleConfig	= require("./module.json");

let _ 				= require("lodash");
let async 			= require("async");
let hashids 		= require(ROOT + "libs/hashids");
let C 				= require(ROOT + "core/constants");

let Device 			= require("./models/device");

function applyLimitOffsetSort(query, args) {
	if (args.limit)
		query.limit(args.limit);

	if (args.offset)
		query.skip(args.offset);

	if (args.sort)
		query.sort(args.sort);

	return query;
}

function hasRole(context, role) {
	return context.user.roles.indexOf(role) != -1;
}

const query = `
	devices(limit: Int, offset: Int, sort: String): [Device]
	device(id: Int, code: String): Device
`;

const typeDefinitions = `
type Device {
	id: Int!
	code: String!
	address: String
	type: String
	name: String
	description: String
	status: Int
	lastCommunication: Timestamp
}
`;

const mutation = ``;

const resolvers = {
	Query: {
		devices(root, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			return applyLimitOffsetSort(Device.find({}), args).exec();
		},

		device(root, args, context) {
			if (!hasRole(context, C.ROLE_USER))
				return null;

			let id = args.id;

			if (args.code)
				id = hashids.decodeHex(args.code);

			if (id)
				return Device.findById(id).exec();

		}

	},

	Mutation: {
	}

};

module.exports = {
	schema: {
		query,
		typeDefinitions,
		mutation
	},
	resolvers
};
