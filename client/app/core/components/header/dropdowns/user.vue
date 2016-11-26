<template lang="pug">
	ul.dropdown-menu.user-menu(:class="{ 'visible': visible }")
		li
			a(v-link="'/profile'")
				.icon
					i.fa.fa-user
				| {{ "MyAccount" | i18n }}
		li
			a(href='#')
				.icon
					i.fa.fa-cog
				| {{ "Settings" | i18n }}
		
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