<template lang="pug">
	admin-page(:schema="schema", :selected="selected", :rows="rows")
</template>

<script>
/*
https://dev-blog.apollodata.com/use-apollo-in-your-vuejs-app-89812429d8b2#.epkgpe2xz
https://github.com/Akryum/vue-apollo

*/

	import Vue from "vue";
	import AdminPage from "../../core/DefaultAdminPage.vue";
	import schema from "./schema";
	import toast from "../../core/toastr";

	import gql from "graphql-tag";
	window["gql"] = gql;

	import ApolloClient, { createNetworkInterface } from "apollo-client";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {
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
		socket: {

			events: {
				/**
				 * New device added
				 * @param  {Object} row Device object
				 */
				created(row) {
					console.log("New device: ", row);
					this.rowAdded(row);

					toast.success(this._("DeviceNameAdded", row), this._("DeviceAdded"));
				},

				/**
				 * Device updated
				 * @param  {Object} row Device object
				 */
				updated(row) {
					console.log("Update device: ", row);
					this.rowChanged(row);

					toast.success(this._("DeviceNameUpdated", row), this._("DeviceUpdated"));
				},

				/**
				 * Device removed
				 * @param  {Object} row Device object
				 */
				removed(row) {
					console.log("Remove device: ", row);
					this.rowRemoved(row);	

					toast.success(this._("DeviceNameDeleted", row), this._("DeviceDeleted"));
				}
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