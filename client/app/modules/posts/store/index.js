import { 
	LOAD, LOAD_MORE, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE, 
	CLEAR, NO_MORE_ITEMS, FETCHING,
	CHANGE_SORT, CHANGE_VIEWMODE 
} from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	rows: [],
	offset: 0,
	hasMore: true,
	fetching: false,
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

	[FETCHING] (state, status) {
		state.fetching = status;
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
			state.rows.unshift(model);
	},

	[UPDATE] (state, model) {
		each(state.rows, (item) => {
			if (item.code == model.code) {
				assign(item, model);
			}
		});
	},

	[REMOVE] (state, model) {
		state.rows = state.rows.filter(item => item.code != model.code);
	}	
};

import * as getters from "./getters";
import * as actions from "./actions";

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};