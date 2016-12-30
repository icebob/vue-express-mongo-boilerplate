<template lang="pug">
	.search-box
		i.fa.fa-search
		input(type="search", v-model="text", :placeholder="'Search3dots' | i18n")

</template>

<script>
	import { mapGetters, mapActions } from "vuex";

	export default {
		computed: {
			...mapGetters([
				"searchText"
			]),
			text: {
				get() {
					return this.searchText;
				},

				set(value) {
					this.searching(value);
				}
			}
		},

		methods: {
			...mapActions([
				"searching"
			])
		}
	};
	
</script>

<style lang="sass">
</style>