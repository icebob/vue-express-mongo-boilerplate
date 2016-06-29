<template lang="jade">
	admin-page(:schema="schema", :selected="selected", :rows="rows")
</template>

<script>
	import Vue from "vue";
	import AdminPage from "../../core/DefaultAdminPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import MixinsIO from "../../core/mixins/io";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {
		/**
		 * Create websocket connection to '/devices' namespace
		 */
		mixins: [ MixinsIO("/devices") ],

		components: {
			AdminPage: AdminPage
		},

		/**
		 * Set page schema as data property
		 */
		data() {
			return {
				schema
			};
		},

		/**
		 * Set Vuex actions & getters
		 */
		vuex: {
			getters,
			actions
		},		

		/**
		 * Route handlers
		 */
		route: {
			activate() {

			},

			data(transition) {
				
			}
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		sockets: {

			/**
			 * New device added
			 * @param  {Object} row Device object
			 */
			new(row) {
				console.log("New device: ", row);
				this.rowAdded(row);

				toast.success(`Device '${row.name}' added!`, "Device added");
			},

			/**
			 * Device updated
			 * @param  {Object} row Device object
			 */
			update(row) {
				console.log("Update device: ", row);
				this.rowChanged(row);

				toast.success(`Device '${row.name}' updated!`, "Device updated");
			},

			/**
			 * Device removed
			 * @param  {Object} row Device object
			 */
			remove(row) {
				console.log("Remove device: ", row);
				this.rowRemoved(row);	

				toast.success(`Device '${row.name}' deleted!`, "Device deleted");
			}
		},		

		/**
		 * Call if the component is created
		 */
		created() {
			// Download rows for the page
			this.downloadRows();
		}
	};
</script>