<template lang="pug">
	.user-box(v-if="me")
	
		.user-info.right(@click="toggleUserMenu()")
			img.avatar(:src='me.gravatar')
			.username {{ me.fullName }}
			i.fa.fa-chevron-down

		user-dropdown(:visible="expandedUserMenu")

		.notification-box.right
			ul.icons
				li(@click="toggleNotifications()", :class=" { active: notifications.length > 0 }")
					i.fa.fa-bell-o
					span {{ notifications.length }}
					.ring

				li(@click="toggleMessages()", :class=" { active: messages.length > 0 }")
					i.fa.fa-envelope-o
					span {{ messages.length }}
					.ring
			
			notifications-dropdown(:visible="expandedNotifications")
			messages-dropdown(:visible="expandedMessages")


</template>

<script>
	import UserDropdown from "./dropdowns/user";
	import NotificationsDropdown from "./dropdowns/notifications";
	import MessagesDropdown from "./dropdowns/messages";

	import * as actions from "../../../modules/session/vuex/actions";
	import * as getters from "../../../modules/session/vuex/getters";


	export default {
		components: {
			UserDropdown,
			NotificationsDropdown,
			MessagesDropdown
		},

		data() {
			return {
				expandedUserMenu: false,
				expandedNotifications: false,
				expandedMessages: false
			};
		},

		/**
		 * Set Vuex actions & getters
		 */
		vuex: {
			getters,
			actions
		},	

		methods: {

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
			}

		}

	};
	
</script>

<style lang="sass">
</style>