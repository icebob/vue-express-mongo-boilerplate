<template lang="pug">
	div
		admin-page(:schema="schema", :selected="selected", :rows="devices")

		br
		br
		.panel.primary
			.header 
				i.fa.fa-info-circle 
				|  Table & Form demo
			.body 
				p This is an admin page demo. We use 
					a(href="https://github.com/icebob/vue-form-generator", target="_blank") vue-form-generator
					|  to generate form from schema. 
				p The table is also generated from schema. You can sort the rows & select multiple rows.
				p If somebody changes a device, you will get a notification toast.
</template>

<script>
	import Vue from "vue";
	import AdminPage from "../../core/DefaultAdminPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import { mapGetters, mapActions } from "vuex";

	export default {
		
		components: {
			AdminPage: AdminPage
		},

		computed: mapGetters("devices", [
			"devices",
			"selected"
		]),

		/**
		 * Set page schema as data property
		 */
		data() {
			return {
				schema
			};
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		socket: {

			prefix: "devices.",

			events: {
				/**
				 * New device added
				 * @param  {Object} res Device object
				 */
				created(res) {
					this.created(res.data);
					toast.success(this._("DeviceNameAdded", res), this._("DeviceAdded"));
				},

				/**
				 * Device updated
				 * @param  {Object} res Device object
				 */
				updated(res) {
					this.updated(res.data);
					toast.success(this._("DeviceNameUpdated", res), this._("DeviceUpdated"));
				},

				/**
				 * Device removed
				 * @param  {Object} res Response object
				 */
				removed(res) {
					this.removed(res.data);	
					toast.success(this._("DeviceNameDeleted", res), this._("DeviceDeleted"));
				}
			}
		},		

		methods: {
			...mapActions("devices", [
				"downloadRows",
				"created",
				"updated",
				"removed",
				"selectRow",
				"clearSelection",
				"saveRow",
				"updateRow",
				"removeRow"
			])
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