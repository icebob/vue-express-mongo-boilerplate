import { INCREMENT, DECREMENT, CHANGE_VALUE } from "./types";

const state = {
	count: 0
};

const mutations = {
	[INCREMENT] (state) {
		state.count += 1;
	},

	[DECREMENT] (state) {
		state.count -= 1;
	},

	[CHANGE_VALUE] (state, newValue) {
		state.count = newValue;
	}
};

export default {
	state,
	mutations
};