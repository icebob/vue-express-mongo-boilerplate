<template lang="jade">
	div
		h2 Home page

		h3 {{ count }}
		button(@click="inc") Increment

</template>

<script>
	import { increment } from "../../vuex/actions";
	import { count } from "../../vuex/getters";

	export default {

		vuex: {
			getters: {
				count
			},
			actions: {
				increment
			}
		},	

		methods: {
			inc() {
				this.increment(this.store);
				this.$socket.emit("inc", this.count);
			}
		}

	}
</script>

<style lang="sass" scoped>
</style>