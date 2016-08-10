<template lang="jade">
	div.user-box.right
	
		.user-info.right(@click="toggleUserMenu()")
			img.avatar(src='https://s3.amazonaws.com/uifaces/faces/twitter/kolage/73.jpg')
			.username John Doe 
			i.fa.fa-chevron-down

		user-dropdown(:visible="expandedUserMenu")

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
			
			notifications-dropdown(:visible="expandedNotifications")
			messages-dropdown(:visible="expandedMessages")


</template>

<script>
	import UserDropdown from "./dropdowns/user";
	import NotificationsDropdown from "./dropdowns/notifications";
	import MessagesDropdown from "./dropdowns/messages";

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