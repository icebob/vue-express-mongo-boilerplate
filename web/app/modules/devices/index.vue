<template lang="jade">
	admin-page(:schema="schema", :selected="selected", :rows="rows")
</template>

<script>
	import Vue from "vue";
	import AdminPage from '../../core/DefaultAdminPage.vue';
	import schema from "./schema";

	import MixinsIO from "../../core/mixins/io";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {
		mixins: [ MixinsIO("/devices") ],

		components: {
			AdminPage: AdminPage
		},

		data() {
			return {
				schema
			}
		},

		vuex: {
			getters,
			actions
		},		

		route: {
			activate() {

			},

			data(transition) {
				
			}
		},

		sockets: {
			new(row) {
				console.log("New device: ", row);
				this.rowAdded(row);
			},

			update(row) {
				console.log("Update device: ", row);
				this.rowChanged(row);
			},

			remove(row) {
				console.log("Remove device: ", row);
				this.rowRemoved(row);	
			}
		},		

		created() {
			this.downloadRows();
		}
	}
</script>