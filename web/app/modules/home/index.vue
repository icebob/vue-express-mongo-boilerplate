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
	import MixinsIO from "../../core/mixins/io";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {
		mixins: [ MixinsIO("/counter") ],

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

		sockets: {
			changed(msg) {
				console.log("New counter value: " + msg);
				this.changeValue(msg);
			}
		}
	}
</script>

<style lang="sass" scoped>
</style>