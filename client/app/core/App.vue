<template lang="jade">
	section.page-header
		.logo.left
			a.nav-item(href="#")
				span 
					strong VEM
					| App

		.menu-toggle.left
			i.fa.fa-bars

		.search-box.left
			i.fa.fa-search
			input#page-search(type="search", placeholder="Search...")

		.user-box.right
			.user-info.right
				img.avatar(src='https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg')
				.username John Doe 
				i.fa.fa-chevron-down

		.notification-box.right
			ul.icons
				li.active
					i.fa.fa-bell-o
					span 5
					.ring

				li
					i.fa.fa-envelope-o
					span 20
					.ring

	aside.menu
		.menu-label General
		ul.menu-list
			li(v-link-active)
				a(v-link="'/home'", :title="_('Home')")
					span.icon
						i.fa.fa-home
					span.label {{ "Home" | i18n }}

			li(v-link-active)
				a(v-link="'/devices'", :title="_('Devices')")
					span.icon
						i.fa.fa-tablet
					span.label {{ "Devices" | i18n }}

			li(v-link-active)
				a(v-link="'/posts'", :title="_('Posts')")
					span.icon
						i.fa.fa-comments
					span.label {{ "Posts" | i18n }}

		.menu-label Session
		ul.menu-list
			li
				a(href="/logout", :title="_('Logout')")
					span.icon
						i.fa.fa-sign-out
					span.label {{ "Logout" | i18n }}


	section.app-main
		router-view(keep-alive)

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
</style>