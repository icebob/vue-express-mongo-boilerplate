<template lang="jade">
	section.page-header
		.logo.left
			a.nav-item(href="#")
				span 
					strong VEM
					| App

		.menu-toggle.left(@click="toggleMenu()")
			i.fa.fa-bars

		.search-box.left
			i.fa.fa-search
			input#page-search(type="search", placeholder="Search...")

		.user-box.right(@click="toggleUserMenu()")
			.user-info.right
				img.avatar(src='https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg')
				.username John Doe 
				i.fa.fa-chevron-down

			ul.dropdown-menu.user-menu(:class="{ 'visible': expandedUserMenu }")
				li
					a(href='#')
						.icon
							i.fa.fa-user
						| Profile
				li
					a(href='#')
						.icon
							i.fa.fa-cog
						| Settings
				
				li.separator

				li
					a(href='/logout')
						.icon
							i.fa.fa-power-off
						| {{ "Logout" | i18n }}			

		.notification-box.right
			ul.icons
				li.active(@click="toggleNotifications()")
					i.fa.fa-bell-o
					span 5
					.ring

				li.active(@click="toggleMessages()")
					i.fa.fa-envelope-o
					span 2
					.ring
			
			.notification-dropdown(:class="{ 'visible': expandedNotifications }")
				.panel
					.header 
						.left Notifications
						.right
							a.link(href="#") 
								small Mark All as Read
					.body 
						.list
							.item
								img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/dustin/73.jpg")
								.body
									p.text-justify 
										strong Thomas 
										| posted a new article
								.footer.text-right
									small.text-muted 1 min ago
							.item
								img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/connor_gaunt/73.jpg")
								.body
									p.text-justify 
										strong Adam 
										| changed his contact information
								.footer.text-right
									small.text-muted 3 min ago
							.item
								img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/73.jpg")
								.body
									p.text-justify 
										strong Samantha 
										| replied to your comment
								.footer.text-right
									small.text-muted 15 min ago
							.item
								img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/ritu/73.jpg")
								.body
									p.text-justify 
										strong Bill 
										| bought a new TV
								.footer.text-right
									small.text-muted 3 hours ago
							.item
								img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/sauro/73.jpg")
								.body
									p.text-justify 
										strong Chris 
										| posted a new blog post
								.footer.text-right
									small.text-muted 1 day ago
					.footer.text-center
						a.link(href="#") See all notifications

			.messages-dropdown(:class="{ 'visible': expandedMessages }")
				.panel
					.header 
						.left Messages
						.right
							a.link(href="#") 
								small Mark All as Read
					.body 
						.list
							.item
								img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/dustin/73.jpg")
								.body
									strong Message title 
										small.text-muted John Doe
									p.text-justify Cupidatat eiusmod commodo excepteur velit magna. Aliqua eu tempor officia officia et ipsum magna sint cillum Lorem reprehenderit.
								.footer.text-right
									small.text-muted 1 min ago
							.item
								img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/connor_gaunt/73.jpg")
								.body
									strong Message title 
										small.text-muted John Doe
									p.text-justify Laborum laboris nulla nisi labore.
								.footer.text-right
									small.text-muted 3 min ago

					.footer.text-center
						a.link(href="#") See all messages

	aside.menu(:class="{ mini: miniMenu }")
		.menu-label General
		ul.menu-list
			li(v-link-active)
				a(v-link="'/home'", :title="_('Home')")
					span.icon
						i.fa.fa-home
					span.label {{ "Home" | i18n }}

			li(v-link-active)
				a(v-link="'/demo'", :title="_('Demo')")
					span.icon
						i.fa.fa-tasks
					span.label {{ "Demo" | i18n }}

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


	section.app-main(:class="{ miniMenu: miniMenu }")
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
				wsReconnecting: false,

				miniMenu: false,
				expandedUserMenu: false,
				expandedNotifications: false,
				expandedMessages: false
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
			},

			toggleUserMenu() {
				this.expandedUserMenu = !this.expandedUserMenu;
				if (this.expandedUserMenu) {
					this.expandedMessages = false;
					this.expandedNotifications = false;
				}
			},

			toggleMessages() {
				this.expandedMessages = !this.expandedMessages;
				if (this.expandedMessages) {
					this.expandedUserMenu = false;
					this.expandedNotifications = false;
				}
			},

			toggleNotifications() {
				this.expandedNotifications = !this.expandedNotifications;
				if (this.expandedNotifications) {
					this.expandedMessages = false;
					this.expandedUserMenu = false;
				}
			},

			toggleMenu() {
				this.miniMenu = !this.miniMenu;
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