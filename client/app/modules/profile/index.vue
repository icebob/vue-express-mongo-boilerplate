<template lang="pug">
	.container
		h2.title {{ "Profile" | i18n }}

		h3 {{ profile | json }}

</template>

<script>
	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	import Service from "../../core/service";

	export default {
		vuex: {
			getters,
			actions
		},	

		methods: {
		},

		created() {
			this.$service = new Service("profile", this); 
			
			// Get my profile
			this.getProfile(); 
		}
	};

</script>

<style lang="sass" scoped>
</style>