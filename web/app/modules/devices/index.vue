<template lang="jade">
	div
		h3 Devices page

		table(v-if="devices.length > 0")
			thead
				tr
					th ID
					th Address
					th Name
					th Description
					th Status
					th Last communication

			tbody
				tr(v-for="device in devices")
					td {{ device.code }}
					td {{ device.address }}
					td {{ device.name }}
					td {{ device.description }}
					td {{ device.status }}
					td {{ device.lastCommunication | ago }}


</template>

<script>
	import { getDevices } from "../../vuex/actions";
	
	import { devices } from "../../vuex/getters";

	export default {

		vuex: {
			getters: {
				devices
			}
		},			

		route: {
			activate() {

			},

			data(transition) {
				
			}
		},

		created() {
			getDevices(this.$store);
		}
	}
</script>

<style lang="sass" scoped>
	table {
		width: 100%;

		tr {

			td {
				text-align: center;
			}

		}

	}
</style>