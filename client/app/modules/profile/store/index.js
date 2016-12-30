import { SET } from "./types";

const state = {
	profile: {}
};

const mutations = {
	[SET] (state, profile) {
		state.profile = profile;
	}
};


export default {
	state,
	mutations
};