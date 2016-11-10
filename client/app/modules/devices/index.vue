<template lang="jade">
	admin-page(:schema="schema", :selected="selected", :rows="rows")
</template>

<script>
	import Vue from "vue";
	import AdminPage from "../../core/DefaultAdminPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import MixinsIO from "../../core/mixins/io";

	import gql from "graphql-tag";
	window["gql"] = gql;

	import ApolloClient, { createNetworkInterface } from "apollo-client";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {
		/**
		 * Create websocket connection to '/devices' namespace
		 */
		mixins: [ MixinsIO() ],

		components: {
			AdminPage: AdminPage
		},

		/**
		 * Set page schema as data property
		 */
		data() {
			return {
				schema
			};
		},

		/**
		 * Set Vuex actions & getters
		 */
		vuex: {
			getters,
			actions
		},		

		/**
		 * Route handlers
		 */
		route: {
			activate() {

			},

			data(transition) {
				
			}
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		sockets: {

			/**
			 * New device added
			 * @param  {Object} row Device object
			 */
			new(row) {
				console.log("New device: ", row);
				this.rowAdded(row);

				toast.success(this._("DeviceNameAdded", row), this._("DeviceAdded"));
			},

			/**
			 * Device updated
			 * @param  {Object} row Device object
			 */
			update(row) {
				console.log("Update device: ", row);
				this.rowChanged(row);

				toast.success(this._("DeviceNameUpdated", row), this._("DeviceUpdated"));
			},

			/**
			 * Device removed
			 * @param  {Object} row Device object
			 */
			remove(row) {
				console.log("Remove device: ", row);
				this.rowRemoved(row);	

				toast.success(this._("DeviceNameDeleted", row), this._("DeviceDeleted"));
			}
		},		

		/**
		 * Call if the component is created
		 */
		created() {
			// Download rows for the page
			this.downloadRows();


			const networkInterface = createNetworkInterface("/graphql");

			networkInterface.use([{
				applyMiddleware(req, next) {
					// Send to back the session ID
					req.options.credentials = "same-origin";
					next();
				}
			}]);

			let client = new ApolloClient({
				networkInterface
			});

			client.query({
				query: gql`
					query getDevice($deviceID: Int!) { 
						device(id: $deviceID) {
							code
							name
							description
							address
							type
							status
							lastCommunication
						}
					}
				`, 
				variables: {
					deviceID: 22
				},
				forceFetch: false
			}).then( (result) => {
				if (result.errors)
					return console.error("Got some GraphQL execution errors!", result.errors);

				if (result.data) {
					console.log(result.data);
				}
			}).catch( (error) => {
				console.error("There was an error sending the query", error);
			});
		}
	};
</script>