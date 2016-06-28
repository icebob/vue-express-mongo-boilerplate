import { LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	all: [],
	selected: []
}

const mutations = {
	[LOAD] (state, devices) {
		state.all.splice(0);
		state.all.push(...devices);
	},

	[ADD] (state, device) {
		state.all.push(device);
	},

	[SELECT] (state, row, multiSelect) {
		if (isArray(row)) {
			state.selected.splice(0);
			state.selected.push(...row);
		} else {
			if (multiSelect === true) {
				if (state.selected.indexOf(row) != -1)
					state.selected.$remove(row);
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

	[UPDATE] (state, device) {
		each(state.all, (item) => {
			if (item.id == device.id)
				assign(item, device);
		});
	},

	[REMOVE] (state, device) {
		// We need find the exact object, because device may come via websocket
		let found = find(state.all, (item) => item.id == device.id);

		if (found) {
			state.all.$remove(found);
		}
	}	
}


export default {
	state,
	mutations
};