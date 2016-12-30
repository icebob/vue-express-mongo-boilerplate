import { LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	rows: [],
	selected: []
};

const mutations = {
	[LOAD] (state, models) {
		state.rows.splice(0);
		state.rows.push(...models);
	},

	[ADD] (state, model) {
		let found = find(state.rows, (item) => item.code == model.code);
		if (!found)
			state.rows.push(model);
	},

	[SELECT] (state, row, multiSelect) {
		if (isArray(row)) {
			state.selected.splice(0);
			state.selected.push(...row);
		} else {
			if (multiSelect === true) {
				if (state.selected.indexOf(row) != -1)
					state.selected = state.selected.filter(item => item != row);
				else
					state.selected.push(row);

			} else {
				state.selected.splice(0);
				state.selected.push(row);
			}
		}
	},

	[CLEAR_SELECT] (state) {
		state.selected.splice(0);
	},

	[UPDATE] (state, model) {
		each(state.rows, (item) => {
			if (item.code == model.code)
				assign(item, model);
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