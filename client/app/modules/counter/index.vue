<template lang="pug">
	.container
		h2.title {{ "Demo" | i18n }}

		h3 Value: {{ count }}
		button.button.success(@click="increment") 
			span.icon
				i.fa.fa-arrow-up 
			span {{ "Increment" | i18n }}
		br
		br
		button.button.warning(@click="decrement") 
			span.icon
				i.fa.fa-arrow-up 
			span {{ "Decrement" | i18n }}

		br
		br
		.panel.primary
			.header 
				i.fa.fa-info-circle 
				|  Websocket demo
			.body 
				p This is a simple counter demo. You can increment & decrement the value with buttons. We use websocket for communication. The value is global, so you can see if somebody changed it.
				p Try the following commands in the console of the browser:
				pre
					| counterService.emit("increment");
					| counterService.emit("set", { value: 50 });

</template>

<script>
	import { mapActions, mapGetters } from "vuex";

	import Service from "../../core/service";

	export default {
		/**
		 * Computed getters
		 */
		 computed: mapGetters("counter", [
			 "count"
		 ]),

		/**
		 * Page methods
		 */
		methods: {
			/**
			 * Actions from store
			 */
			...mapActions("counter", [
				"getValue",
				"increment",
				"decrement",
				"changedValue"
			])
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		socket: {
			prefix: "counter.",
			//namespace: "/counter",

			events: {
				/**
				 * Counter value is changed
				 * @param  {Number} msg Value of counter
				 */
				changed(res) {
					console.log("Counter changed to " + res.data + (res.user ? " by " + res.user.fullName : ""));
					this.changedValue(res.data);
				}
			}
		},

		created() {
			this.$service = new Service("counter", this); 
			
			// Get the latest value of counter
			this.getValue(); 
		}
	};

</script>

<style lang="sass" scoped>
</style>