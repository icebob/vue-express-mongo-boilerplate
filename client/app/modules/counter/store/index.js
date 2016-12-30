const state = {
	count: 0
};

const mutations = {
	["CHANGED_VALUE"](state, newValue) {
		state.count = newValue;
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