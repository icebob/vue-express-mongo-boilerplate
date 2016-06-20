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
			}
		}
	}
</script>

<style lang="sass" scoped>
h1 {
  color: red;
}
</style>