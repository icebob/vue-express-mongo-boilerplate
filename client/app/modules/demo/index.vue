<template lang="jade">
	.container
		h2.title {{ "Demo" | i18n }}

		h3 {{ count }}
		button.button.success(@click="inc") 
			span.icon
				i.fa.fa-arrow-up 
			span {{ "Increment" | i18n }}
		br
		br
		button.button.warning(@click="dec") 
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
		mixins: [ MixinsIO() ],

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
				this.increment(this);
			},

			/**
			 * Decrement counter
			 */
			dec() {
				this.decrement(this);
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
			["/counter/changed"] (msg) {
				console.log("New counter value: " + msg);
				this.changedValue(msg);
			}
		}
	};

</script>

<style lang="sass" scoped>
</style>