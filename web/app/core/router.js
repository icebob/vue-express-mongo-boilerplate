import Vue from 'vue';
import VueRouter from 'vue-router';

module.exports = function() {

	Vue.use(VueRouter);

	var router = new VueRouter({
		linkActiveClass: "active"
	});

	/*
	router.map({
		'/foo': {
			component: Foo
		},
		'/bar': {
			component: Bar
		}
	});*/

	return router;
}