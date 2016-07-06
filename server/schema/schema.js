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

	posts: [Post]
	post(id: Int!): Post
	#postByCode(code: String!): Post

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
	provider: String
	roles: [String]
	verified: Boolean
	gravatar: String
	lastLogin: Timestamp
	posts: [Post]
}

type Post {
	id: Int!
	code: String!
	title: String
	content: String
	author: User!
	views: Int
	upVoters: [User]
	downVoters: [User]
	votes: Int,
	createdAt: Timestamp
	updatedAt: Timestamp
}

schema {
  query: Query
}
`;

module.exports = [typeDefinitions];
