import { CHANGED_VALUE } from "./types";

const state = {
	count: 0
};

const mutations = {
	[CHANGED_VALUE] (state, newValue) {
		state.count = newValue;
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