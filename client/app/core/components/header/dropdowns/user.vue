<template lang="jade">
	ul.dropdown-menu.user-menu(:class="{ 'visible': visible }")
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


</template>

<script>

	export default {

		props: [
			"visible"
		]

	};
	
</script>

<style lang="sass">
</style>