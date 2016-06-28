<template lang="jade">
	admin-page(:schema="schema", :selected="selected", :rows="rows")
</template>

<script>
	import Vue from "vue";
	import AdminPage from '../../core/DefaultAdminPage.vue';
	import schema from "./schema";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {

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

		created() {
			this.downloadRows();

			console.log("Add io handlers...");

			this.$socket.on("newDevice", (row) => {
				console.log("New device: ", row);
				this.rowAdded(row);
			});			

			this.$socket.on("updateDevice", (row) => {
				console.log("Update device: ", row);
				this.rowChanged(row);
			});			

			this.$socket.on("removeDevice", (row) => {
				console.log("Remove device: ", row);
				this.rowRemoved(row);
			});			

		},

		destroyed() {
			console.log("Remove io handlers...");
			this.$socket.off("newDevice");
			this.$socket.off("updateDevice");
			this.$socket.off("removeDevice");
		}
	}
</script>