<template lang="jade">
	div
		h2 {{ msg }}
		h3 {{ count }}
		button(@click="inc") Increment
		br
</template>

<script>
	export default {
		data () {
			return {
				count: 0,
				msg: 'Hello Vue!'
			}
		},

		methods: {
			inc() {
				this.count += 1;
				window.socket.emit("inc", this.count);
			}
		}
	}
</script>

<style lang="sass" scoped>
	@import "../scss/variables";

	h2 {
	  color: $masterColor;
	}
</style>