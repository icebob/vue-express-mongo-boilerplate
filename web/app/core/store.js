import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const state = {
	count: 0
}

const mutations = {
	INCREMENT (state) {
		state.count += 1;
	}
}


export default new Vuex.Store({
	state,
	mutations
});