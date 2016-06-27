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
				tr(v-for="device in devices", @click="selectDevice(device)", :class="{ selected: device == selected }")
					td {{ device.code }}
					td {{ device.address }}
					td {{ device.name }}
					td {{ device.description }}
					td {{ device.status | status }}
					td {{ device.lastCommunication | ago }}


</template>

<script>
	import { getDevices, selectDevice } from "../../vuex/actions";
	
	import { devices, selected } from "../../vuex/getters";

	export default {

		vuex: {
			getters: {
				devices,
				selected
			},

			actions: {
				selectDevice
			}
		},	

		filters: {
			status(val) {
				if (val == 1)
					return "Active";
				else
					return "Inactive";
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
	@import "../../../scss/variables";

	table {
		width: 100%;

		tr {
			cursor: pointer;

			td {
				text-align: center;
			}

			&.selected {
				background-color: rgba($masterColor, 0.3);
			}
		}

	}
</style>