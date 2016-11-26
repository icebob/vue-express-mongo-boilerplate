import Vue from "vue";
import Vuex from "vuex";

import session from "../modules/session/vuex";
import devices from "../modules/devices/vuex";
import posts from "../modules/posts/vuex";
import counter from "../modules/demo/vuex";
import profile from "../modules/profile/vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		session,
		counter,
		devices,
		posts,
		profile
	}
});