<template lang="pug">
	.search-box
		i.fa.fa-search
		input(type="search", v-model="text", placeholder="{{ 'Search3dots' | i18n }}")

</template>

<script>
	import { searching } from "../../../modules/session/vuex/actions";
	import { searchText } from "../../../modules/session/vuex/getters";

	export default {
		vuex: {
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
		}
	};
	
</script>

<style lang="sass">
</style>