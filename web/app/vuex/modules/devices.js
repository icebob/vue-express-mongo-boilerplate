import { ADD_DEVICES } from "../mutation-types";

const state = {
	all: []
}

const mutations = {
	[ADD_DEVICES] (state, devices) {
		state.all.splice(0);
		state.all.push(...devices);
	}
}


export default {
	state,
	mutations
};