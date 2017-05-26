<template lang="pug">
	section.page-header

		logo.left

		.menu-toggle.left(@click="toggleSidebar()")
			i.fa.fa-bars

		search-box.left

		user-box.right

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

<style lang="scss">
</style>