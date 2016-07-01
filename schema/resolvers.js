"use strict";

let _ = require("lodash");
let fakerator = require("fakerator")();

let users = fakerator.times(fakerator.entity.user, 5);
let posts = fakerator.times(fakerator.entity.post, 10);

let i = 1;
_.each(users, (user) => {
	user.id = i++;
	user.posts = [];
});

let id = 1;
_.each(posts, (post) => {
	let user = fakerator.random.arrayElement(users);
	post.id = id++;
	post.author = user;
	post.views = fakerator.random.number(200);
	user.posts.push(post);
});

//console.log(users);
//console.log(posts);

module.exports = {
	Query: {
		author(root, args) {
			return _.find(users, (user) => user.id == args.id);
		},
		post(root, args) {
			return _.find(posts, (post) => post.id == args.id);
		}
	},

	Author: {
		posts(author) {
			return author.posts;
		}
	},

	Post: {
		author(post) {
			return post.author;
		}
	}
}