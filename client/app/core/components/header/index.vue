<template lang="jade">
	section.page-header

		logo

		.menu-toggle.left(@click="toggleSidebar()")
			i.fa.fa-bars

		search-box

		user-box(:toggle="toggleUserMenu", :expanded="expandedUserMenu")

</template>

<script>
	import Logo from "./logo";
	import SearchBox from "./search-box";
	import UserBox from "./user-box";

	export default {
		components: {
			Logo,
			SearchBox,
			UserBox
		},

		props: [
			"toggleSidebar"
		]

	};
	
</script>

<style lang="sass">
</style>