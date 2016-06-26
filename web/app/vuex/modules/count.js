import { INCREMENT } from "../mutation-types";

const state = {
	count: 0
}

const mutations = {
	[INCREMENT] (state) {
		state.count += 1;
	}
}

export default {
	state,
	mutations
};