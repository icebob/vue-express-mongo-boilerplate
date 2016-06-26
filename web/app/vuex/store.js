import Vue from "vue";
import Vuex from "vuex";

import types from "./types";

Vue.use(Vuex);

const state = {
	count: 0,
	devices: []
}

const mutations = {
	[types.INCREMENT] (state) {
		state.count += 1;
	},

	[types.ADD_DEVICES] (state, devices) {
		state.devices.splice(0);
		state.devices.push(...devices);
	}
}


export default new Vuex.Store({
	state,
	mutations
});