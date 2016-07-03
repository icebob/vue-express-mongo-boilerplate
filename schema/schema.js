"use strict";

const typeDefinitions = `

scalar Timestamp

type Query {
	devices: [Device]
	device(id: Int!): Device
	#deviceByCode(code: String!): Device

	users: [User]
	user(id: Int!): User
	#userByCode(code: String!): User
}

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

type User {
	id: Int!
	code: String!
	fullName: String
	email: String
	username: String
	provider: String,
	roles: [String]
	verified: Boolean
	lastLogin: Timestamp
}

schema {
  query: Query
}
`;

module.exports = [typeDefinitions];
