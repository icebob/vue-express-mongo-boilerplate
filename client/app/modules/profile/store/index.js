const state = {
	profile: {}
};

const mutations = {
	["UPDATE"] (state, profile) {
		state.profile = profile;
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