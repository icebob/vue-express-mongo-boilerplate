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
	import { increment, decrement, changeValue } from "./vuex/actions";
	import { count } from "./vuex/getters";

	export default {

		vuex: {
			getters: {
				count
			},
			actions: {
				increment, 
				decrement,
				changeValue
			}
		},	

		methods: {
			inc() {
				this.increment(this.store);
				this.$socket.emit("counter", this.count);
			},

			dec() {
				this.decrement(this.store);
				this.$socket.emit("counter", this.count);
			}
		},

		created() {
			this.$socket.on("counter", (msg) => {
				console.log("New counter value: " + msg);
				this.changeValue(msg);

			});		

		},

		destroyed() {
			this.$socket.off("counter");
		}		

	}
</script>

<style lang="sass" scoped>
</style>