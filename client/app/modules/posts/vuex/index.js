import { 
	LOAD, LOAD_MORE, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE, 
	CLEAR, NO_MORE_ITEMS, 
	CHANGE_SORT, CHANGE_VIEWMODE 
} from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	rows: [],
	offset: 0,
	hasMore: true,
	sort: "-votes",
	viewMode: "all"
};

const mutations = {
	[LOAD] (state, models) {
		state.rows.splice(0);
		state.rows.push(...models);
		state.offset = state.rows.length;
	},

	[LOAD_MORE] (state, models) {
		state.rows.push(...models);
		state.offset = state.rows.length;
	},

	[CLEAR] (state) {
		state.offset = 0;
		state.hasMore = true;
	},

	[CHANGE_SORT] (state, sort) {
		state.sort = sort;
		mutations[CLEAR](state);
	},

	[CHANGE_VIEWMODE] (state, mode) {
		state.viewMode = mode;
		mutations[CLEAR](state);
	},

	[NO_MORE_ITEMS] (state) {
		state.hasMore = false;
	},

	[ADD] (state, model) {
		let found = find(state.rows, (item) => item.code == model.code);
		if (!found)
			state.rows.push(model);
	},

	[UPDATE] (state, model) {
		each(state.rows, (item) => {
			if (item.code == model.code) {
				assign(item, model);
			}
		});
	},

	[REMOVE] (state, model) {
		// We need find the exact object, because model may come via websocket
		let found = find(state.rows, (item) => item.code == model.code);

		if (found) {
			state.rows.$remove(found);
		}
	}	
};


export default {
	state,
	mutations
};