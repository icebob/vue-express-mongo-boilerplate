<template lang="jade">
	div
		ul
			li
				a(v-link="'home'") Home
			li
				a(v-link="'devices'") Devices

		router-view(keep-alive)

		br
		br
		a(href="/logout") Logout

</template>

<script>
	import Vue from "vue";
	import socket from "./socket-io";
	import store from "../vuex/store";

	import { changeValue } from "../modules/home/vuex/actions";
	import { addDevice, updateDevice, removeDevice } from "../modules/devices/vuex/actions";

	export default {
		store: store,

		data () {
			return {
			}
		},

		vuex: {
			actions: {
				changeValue, 
				addDevice,
				updateDevice,
				removeDevice
			}
		},

		created() {
			console.log("App started!");

			this.$socket.emit("welcome", "Hi I'm here!");

			this.$socket.on("counter", (msg) => {
				console.log("New counter value: " + msg);
				this.changeValue(msg);

			});


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

			window.app = this;
		},
		destroyed() {
			if (this.$socket)
				this.$socket.disconnect();
		}
	}
</script>

<style lang="sass">
	@import "../../scss/variables";

	h2 {
	  color: $masterColor;
	}
</style>