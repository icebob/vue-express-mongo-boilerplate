import { CHANGED_VALUE } from "./types";

const state = {
	count: 0
};

const mutations = {
	[CHANGED_VALUE] (state, newValue) {
		state.count = newValue;
	}
};

export default {
	state,
	mutations
};