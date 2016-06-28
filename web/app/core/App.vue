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
	import socket from "./socket-io";
	import store from "../vuex/store";

	// Initialize vue-form-generator
	Vue.use(VueFormGenerator);

	export default {
		store: store,

		data () {
			return {
			}
		},

		created() {
			console.log("App started!");

			this.$socket.emit("welcome", "Hi I'm here!");

			window.app = this;
		},
		destroyed() {
			if (this.$socket)
				this.$socket.disconnect();
		}
	}
</script>

<style lang="sass">
	@import "../../scss/variables";

	h2 {
	  color: $masterColor;
	}
</style>