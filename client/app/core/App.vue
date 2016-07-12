<template lang="jade">
	div
		ul
			li(v-link-active)
				a(v-link="'/home'") {{ "Home" | i18n }}
			li(v-link-active)
				a(v-link="'/devices'") {{ "Devices" | i18n }}
			li(v-link-active)
				a(v-link="'/posts'") {{ "Posts" | i18n }}

		router-view(keep-alive)

		br
		br
		a(href="/logout", v-i18n="Logout")

</template>

<script>
	import Vue from "vue";
	import VueFormGenerator from "vue-form-generator";
	import MixinsIO from "./mixins/io";
	import store from "../store";

	// Register vue-form-generator
	Vue.use(VueFormGenerator);

	export default {

		/**
		 * Create websocket connection to the root namespace
		 */		
		mixins: [ MixinsIO() ],

		/**
		 * Create app data object
		 */
		data() {
			return {
				wsReconnecting: false
			};
		},

		watch: {
			$lng() {
				console.log("Language updated");
				this.update(this);
			}
		},

		/**
		 * Set the vuex store object
		 */
		store: store,

		/**
		 * Socket handlers. Every property is an event handler
		 */
		sockets: {

			/**
			 * Send welcome message after connect
			 */
			connect() {
				if (this.wsReconnecting)
					// Reload browser if connection established after disconnect
					window.location.reload(true);
				else
					this.$socket.emit("welcome", "Hello! " + navigator.userAgent);
			},

			disconnect() {
				this.wsReconnecting = true;
			}
		},

		methods: {
			update: function(vm) {
				if (vm == null)
					return;
				
				let i = vm._watchers.length;
				while (i--)
					vm._watchers[i].update(true);
				
				let children = vm.$children;
				i = children.length;
				while (i--)
					this.update(children[i]);
			}
		},

		/**
		 * Application created
		 */
		created() {
			console.log("App started!");
			window.app = this;
		}
	};
</script>

<style lang="sass">
	@import "../../scss/variables";

	h2 {
	  color: $masterColor;
	}

	li.active {
		a {
			font-weight: 600;
			color: $color5;
		}
	}
</style>