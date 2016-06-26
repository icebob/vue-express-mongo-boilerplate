import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from "../modules/home";
import Devices from "../modules/devices";

module.exports = function() {

	Vue.use(VueRouter);

	var router = new VueRouter({
		linkActiveClass: "active"
	});

	
	router.map({
		'/devices': {
			component: Devices
		},
		'*': {
			component: Home
		}
	});

	return router;
}