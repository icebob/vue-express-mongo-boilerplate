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
	import { increment, decrement } from "../../vuex/actions";
	import { count } from "../../vuex/getters";

	export default {

		vuex: {
			getters: {
				count
			},
			actions: {
				increment, 
				decrement
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
		}

	}
</script>

<style lang="sass" scoped>
</style>