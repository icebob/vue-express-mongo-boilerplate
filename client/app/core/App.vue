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

				li.active
					i.fa.fa-envelope-o
					span 20
					.ring

	aside.menu
		.menu-label General
		ul.menu-list
			li
				a(v-link="'/home'") {{ "Home" | i18n }}
			li
				a(v-link="'/devices'") {{ "Devices" | i18n }}
			li
				a(v-link="'/posts'") {{ "Posts" | i18n }}

		.menu-label Session
		ul.menu-list
			li
				a.button(href="/logout")
					span.icon
						i.fa.fa-sign-out
					span {{ "Logout" | i18n }}


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

	aside {
		position: fixed;
		top: 70px;
		left: 0;
		bottom: 0;
		padding: 20px 0 50px;
		width: 180px;
		min-width: 45px;
		max-height: 100vh;
		height: 100%;
		z-index: 1023;
		background: #fff;
		box-shadow: 0 2px 3px hsla(0,0%,7%,.1),0 0 0 1px hsla(0,0%,7%,.1);
		overflow-y: auto;
		overflow-x: hidden;		
	}

	.app-main {
		padding-top: 50px;
		margin-left: 180px;		
	}
</style>