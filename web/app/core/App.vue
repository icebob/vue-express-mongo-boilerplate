<template lang="jade">
	div
		h2 {{ msg }}
		h3 {{ count }}
		button(@click="inc") Increment
		br
</template>

<script>
	import io from "socket.io-client";
	import store from "../vuex/store";
	import { increment } from "../vuex/actions";

	export default {
		store: store,

		vuex: {
			getters: {
				count: state => state.count
			},
			actions: {
				increment
			}
		},

		data () {
			return {
				msg: 'Hello Vue!',

				socket: null
			}
		},

		methods: {
			inc() {
				this.increment(store);
				this.socket.emit("inc", this.count);
			}
		},

		created() {
			console.log("App started!");

			this.socket = io();
			this.socket.on("connect", () => {
				console.log("WS connected!", this.socket);

				this.socket.emit("welcome", "Hi I'm here!");
			});

			window.app = this;
		},
		destroyed() {
			if (this.socket)
				this.socket.disconnect();
		}
	}
</script>

<style lang="sass" scoped>
	@import "../../scss/variables";

	h2 {
	  color: $masterColor;
	}
</style>