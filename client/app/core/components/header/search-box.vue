<template lang="pug">
	.search-box
		i.fa.fa-search
		input(type="search", v-model="text", :placeholder="Search3dots | i18n")

</template>

<script>
	export default {
		/*vuex: {
			getters: {
				searchText
			},
			actions: {
				searching
			}
		},

		computed: {
			text: {
				get() {
					return this.searchText;
				},

				set(value) {
					this.searching(value);
				}
			}
		}*/
		data() {
			return { text: ""}
		}
	};
	
</script>

<style lang="sass">
</style>