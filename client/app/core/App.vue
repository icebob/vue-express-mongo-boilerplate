<template lang="jade">
	div
		page-header(:toggle-sidebar="toggleSidebar")

		sidebar(:minimized="miniSidebar")

		section.app-main(:class="{ miniSidebar: miniSidebar }")
			router-view(keep-alive)

</template>

<script>
	import Vue from "vue";
	import VueFormGenerator from "vue-form-generator";
	import MixinsIO from "./mixins/io";
	import store from "../store";

	import PageHeader from "./components/header/index";
	import Sidebar from "./components/sidebar/index";

	import * as actions from "../modules/session/vuex/actions";
	import * as getters from "../modules/session/vuex/getters";

	// Register vue-form-generator
	Vue.use(VueFormGenerator);

	export default {

		/**
		 * Create websocket connection to the root namespace
		 */		
		mixins: [ MixinsIO() ],

		/**
		 * Load sub-components
		 */
		components: {
			PageHeader,
			Sidebar
		},

		/**
		 * Create app data object
		 */
		data() {
			return {
				wsReconnecting: false,

				miniSidebar: false
			};
		},

		/**
		 * Set Vuex actions & getters
		 */
		vuex: {
			getters,
			actions
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
			},


			toggleSidebar() {
				this.miniSidebar = !this.miniSidebar;
			}
		},

		/**
		 * Application created
		 */
		created() {
			console.log("App started!");
			window.app = this;

			this.getSessionUser();
		}
	};
</script>

<style lang="sass">
</style>