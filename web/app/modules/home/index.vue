<template lang="jade">
	div
		h2 Home page

		h3 {{ count }}
		button(@click="inc") 
			i.fa.fa-arrow-up 
			| Increment
		br
		br
		button(@click="dec") 
			i.fa.fa-arrow-up 
			| Decrement

</template>

<script>
	import io from "socket.io-client";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {

		vuex: {
			getters,
			actions
		},	

		methods: {
			inc() {
				this.increment();
				this.$socket.emit("changed", this.count);
			},

			dec() {
				this.decrement();
				this.$socket.emit("changed", this.count);
			}
		},

		created() {
			console.log("Created counter page");
			this.$socket = io.connect("/counter");

			this.$socket.on("changed", (msg) => {
				console.log("New counter value: " + msg);
				this.changeValue(msg);
			});		

		},

		destroyed() {
			this.$socket.off("changed");
		}		

	}
</script>

<style lang="sass" scoped>
</style>