import { LOAD_DEVICES, ADD_DEVICE, SELECT_DEVICE, UPDATE_DEVICE, REMOVE_DEVICE } from "../../../vuex/mutation-types";

import { each, find, assign, remove } from "lodash";

const state = {
	all: [],
	selected: null
}

const mutations = {
	[LOAD_DEVICES] (state, devices) {
		state.all.splice(0);
		state.all.push(...devices);
	},

	[ADD_DEVICE] (state, device) {
		state.all.push(device);
		state.selected = device;
	},

	[SELECT_DEVICE] (state, device) {
		state.selected = device;
	},

	[UPDATE_DEVICE] (state, device) {
		each(state.all, (item) => {
			if (item.id == device.id)
				assign(item, device);
		});
	},

	[REMOVE_DEVICE] (state, device) {
		// We need find the exact object, because device may come via websocket
		let found = find(state.all, (item) => item.id == device.id);

		if (found) {
			state.all.$remove(found);
			state.selected = null;
		}
	}	
}


export default {
	state,
	mutations
};