import Vue from "vue";
import Vuex from "vuex";

import devices from "./modules/devices";
import counter from "./modules/counter";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		counter,
		devices
	}
});