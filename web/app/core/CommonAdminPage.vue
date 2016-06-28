<template lang="jade">
	component(:is="pageType", :schema="schema", v-if="schema")
</template>

<script>
	//import DefaultPage from '../pages/defaultPage.vue';
	import TestData from '../utils/testData';
	import {each} from 'lodash';

	// Load all pages from '../pages' folder
	let Pages = require.context('../pages/', false, /^\.\/([\w-_]+)Page\.vue$/);
	let pageComponents = {};
	each(Pages.keys(), (key) => {
		let compName = Vue.util.classify(key.replace(/^\.\//, "").replace(/\.vue/, ""));
		pageComponents[compName] = Pages(key);
	});

	export default {
		components: pageComponents,

		data() {
			return {
				pageType: null,
				schema: null,
				rows: []
			}
		},

		route: {
			data(transition) {
				return {
					pageType: transition.to.pageType,
					schema: require("../pages/schemas/" + transition.to.name),
					rows: TestData.getDataForPage(transition.to.name)
				}
			}
		}
	}
</script>

<style lang="sass">
</style>