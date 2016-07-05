import Vue from "vue";
import Vuex from "vuex";

import devices from "./modules/devices/vuex";
import posts from "./modules/posts/vuex";
import counter from "./modules/home/vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		counter,
		devices,
		posts
	}
});