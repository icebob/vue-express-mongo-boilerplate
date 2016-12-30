import { SET } from "./types";

const state = {
	profile: {}
};

const mutations = {
	[SET] (state, profile) {
		state.profile = profile;
	}
};

import * as getters from "./getters";
import * as actions from "./actions";

export default {
	state,
	getters,
	actions,
	mutations
};