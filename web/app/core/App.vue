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
	import IO from "socket.io-client";
	import store from "../store";

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

			this.$socket = IO();
			this.$socket.on("connect", () => {
				console.log("Websocket connected!");

				this.$socket.emit("welcome", "Hello! " + navigator.userAgent);
			})

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