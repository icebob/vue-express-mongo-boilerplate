import { ADD_DEVICES, SELECT_DEVICE } from "../../mutation-types";

const state = {
	all: [],
	selected: null
}

const mutations = {
	[ADD_DEVICES] (state, devices) {
		state.all.splice(0);
		state.all.push(...devices);
	},

	[SELECT_DEVICE] (state, device) {
		state.selected = device;
	}
}


export default {
	state,
	mutations
};