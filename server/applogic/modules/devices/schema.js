"use strict";

// let ROOT 			= "../../../";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

//let moduleConfig	= require("./module.json");

let _ 				= require("lodash");
let async 			= require("async");
let C 				= require("../../../core/constants");

let Device 			= require("./models/device");

let helper			= require("../../../libs/schema-helper");


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
			if (!helper.hasRole(context, C.ROLE_USER))
				return null;

			return helper.applyLimitOffsetSort(Device.find({}), args).exec();
		},

		device(root, args, context) {
			if (!helper.hasRole(context, C.ROLE_USER))
				return null;

			let id = args.id;

			if (args.code)
				id = Device.schema.methods.decodeID(args.code);

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
