import { LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	rows: []
};

const mutations = {
	[LOAD] (state, posts) {
		state.rows.splice(0);
		state.rows.push(...posts);
	},

	[ADD] (state, post) {
		state.rows.push(post);
	},

	[UPDATE] (state, post) {
		each(state.rows, (item) => {
			if (item.id == post.id) {
				// TODO: author will be lost
				let author = item.author;
				assign(item, post);
				item.author = author;
			}
		});
	},

	[REMOVE] (state, post) {
		// We need find the exact object, because post may come via websocket
		let found = find(state.rows, (item) => item.id == post.id);

		if (found) {
			state.rows.$remove(found);
		}
	}	
};


export default {
	state,
	mutations
};