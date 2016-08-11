<template lang="jade">
	section.page-header

		logo.left

		.menu-toggle.left(@click="toggleSidebar()")
			i.fa.fa-bars

		search-box.left(:model.sync="search")

		user-box.right(:toggle="toggleUserMenu", :expanded="expandedUserMenu")

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
			"search",
			"toggleSidebar"
		]

	};
	
</script>

<style lang="sass">
</style>