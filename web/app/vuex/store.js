import Vue from "vue";
import Vuex from "vuex";

import devices from "./modules/devices";
import count from "./modules/count";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		count,
		devices
	}
});