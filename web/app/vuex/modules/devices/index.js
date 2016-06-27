import { LOAD_DEVICES, ADD_DEVICE, SELECT_DEVICE, UPDATE_DEVICE, REMOVE_DEVICE } from "../../mutation-types";

import { each, assign, remove } from "lodash";

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
		state.all.$remove(device);
		state.selected = null;
	}	
}


export default {
	state,
	mutations
};