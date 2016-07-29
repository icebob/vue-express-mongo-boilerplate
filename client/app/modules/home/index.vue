<template lang="jade">
	.container
		h2.title {{ "Home" | i18n }}

		h3 {{ count }}
		button.button.is-success(@click="inc") 
			span.icon
				i.fa.fa-arrow-up 
			span {{ "Increment" | i18n }}
		br
		br
		button.button.is-warning(@click="dec") 
			span
				i.fa.fa-arrow-up 
			span {{ "Decrement" | i18n }}

</template>

<script>
	import MixinsIO from "../../core/mixins/io";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {
		/**
		 * Create websocket connection to '/counter' namespace
		 */
		mixins: [ MixinsIO("/counter") ],

		/**
		 * Set Vuex actions & getters
		 */
		vuex: {
			getters,
			actions
		},	

		/**
		 * Page methods
		 */
		methods: {

			/**
			 * Increment counter
			 */
			inc() {
				this.increment();
				this.$socket.emit("changed", this.count);
			},

			/**
			 * Decrement counter
			 */
			dec() {
				this.decrement();
				this.$socket.emit("changed", this.count);
			}
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		sockets: {

			/**
			 * Counter value is changed
			 * @param  {Number} msg Value of counter
			 */
			changed(msg) {
				console.log("New counter value: " + msg);
				this.changeValue(msg);
			}
		}
	};
</script>

<style lang="sass" scoped>
</style>