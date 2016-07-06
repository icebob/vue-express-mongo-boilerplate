"use strict";

const typeDefinitions = `

scalar Timestamp

type Query {
	devices(limit: Int, offset: Int, sort: String): [Device]
	device(id: Int!): Device
	#deviceByCode(code: String!): Device

	users(limit: Int, offset: Int, sort: String): [User]
	user(id: Int!): User
	#userByCode(code: String!): User

	posts(limit: Int, offset: Int, sort: String): [Post]
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
	posts(limit: Int, offset: Int, sort: String): [Post]
}

type Post {
	id: Int!
	code: String!
	title: String
	content: String
	author: User!
	views: Int
	voters(limit: Int, offset: Int, sort: String): [User]
	upVoters(limit: Int, offset: Int, sort: String): [User]
	downVoters(limit: Int, offset: Int, sort: String): [User]
	votes: Int,
	createdAt: Timestamp
	updatedAt: Timestamp
}

type Mutation {
	upVote(postID: Int!): Post
	downVote(postID: Int!): Post
}

schema {
  query: Query
  mutation: Mutation
}
`;

module.exports = [typeDefinitions];
