"use strict";

const typeDefinitions = `
type Query {
  author(id: Int): Author
  post(id: Int): Post
  getFortuneCookie: String
}

type Author {
	id: Int
	firstName: String
	lastName: String,
	email: String
	posts: [Post]
}

type Post {
	id: Int
	title: String
	text: String 
	keywords: [String]
	views: Int 
	author: Author
}

schema {
  query: Query
}
`;

module.exports = [typeDefinitions];
