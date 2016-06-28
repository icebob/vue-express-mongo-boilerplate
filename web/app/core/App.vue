<template lang="jade">
	div
		ul
			li
				a(v-link="'home'") Home
			li
				a(v-link="'devices'") Devices

		router-view(keep-alive)

		br
		br
		a(href="/logout") Logout

</template>

<script>
	import Vue from "vue";
	import VueFormGenerator from "vue-form-generator";
	import MixinsIO from "./mixins/io";
	import store from "../store";

	// Register vue-form-generator
	Vue.use(VueFormGenerator);

	export default {
		mixins: [ MixinsIO() ],

		store: store,

		sockets: {
			connect() {
				this.$socket.emit("welcome", "Hello! " + navigator.userAgent);
			}
		},

		created() {
			console.log("App started!");
			window.app = this;
		}
	}
</script>

<style lang="sass">
	@import "../../scss/variables";

	h2 {
	  color: $masterColor;
	}
</style>