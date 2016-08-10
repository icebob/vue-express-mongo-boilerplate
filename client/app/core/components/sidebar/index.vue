<template lang="jade">
	aside.menu(:class="{ mini: minimized }")
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
</template>

<script>

	export default {
		props: [
			"minimized"
		]
	};
	
</script>

<style lang="sass">
</style>