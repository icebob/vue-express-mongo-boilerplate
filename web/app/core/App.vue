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
	import io from "socket.io-client";
	import store from "../vuex/store";

	import { changeValue } from "../vuex/modules/counter/actions";

	Vue.prototype.$socket = io();

	export default {
		store: store,

		data () {
			return {
			}
		},

		created() {
			console.log("App started!");

			this.$socket.on("connect", () => {
				console.log("WS connected!", this.$socket);

				this.$socket.emit("welcome", "Hi I'm here!");

				this.$socket.on("counter", (msg) => {
					console.log("New counter value: ", msg);
					changeValue(this.$store, msg);

				})
			});

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