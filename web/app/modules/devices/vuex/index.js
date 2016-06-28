import { LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

import { each, find, assign, remove, isArray } from "lodash";

const state = {
	rows: [],
	selected: []
}

const mutations = {
	[LOAD] (state, devices) {
		state.rows.splice(0);
		state.rows.push(...devices);
	},

	[ADD] (state, device) {
		state.rows.push(device);
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
		each(state.rows, (item) => {
			if (item.id == device.id)
				assign(item, device);
		});
	},

	[REMOVE] (state, device) {
		// We need find the exact object, because device may come via websocket
		let found = find(state.rows, (item) => item.id == device.id);

		if (found) {
			state.rows.$remove(found);
		}
	}	
}


export default {
	state,
	mutations
};