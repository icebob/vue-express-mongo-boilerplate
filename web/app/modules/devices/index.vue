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
				schema,
				getters, 
				actions,
				base: this
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
			this.downloadDevices();

			console.log("Add io handlers...");

			this.$socket.on("newDevice", (device) => {
				console.log("New device added: ", device);
				this.addDevice(device);
			});			

			this.$socket.on("updateDevice", (device) => {
				console.log("Update device: ", device);
				this.updateDevice(device);
			});			

			this.$socket.on("removeDevice", (device) => {
				console.log("Remove device: ", device);
				this.removeDevice(device);
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