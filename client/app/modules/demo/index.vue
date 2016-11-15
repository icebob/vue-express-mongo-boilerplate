<template lang="pug">
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
	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {
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
		socket: {

			prefix: "/counter/",

			//namespace: "/counter",

			events: {
				/**
				 * Counter value is changed
				 * @param  {Number} msg Value of counter
				 */
				changed(msg) {
					console.log("New counter value: " + msg);
					this.changedValue(msg);
				}
			}
		}
	};

</script>

<style lang="sass" scoped>
</style>