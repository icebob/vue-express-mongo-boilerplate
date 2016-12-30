import axios from "axios";
import IO from "socket.io-client";
import gql from "graphql-tag";
import ApolloClient, { createNetworkInterface } from "apollo-client";

window.gql = gql; // debug

// Create the apollo client for GraphQL
const networkInterface = createNetworkInterface({
	uri: "/graphql",
	opts: {
		credentials: "same-origin"
	}
});

const apolloClient = new ApolloClient({
	networkInterface
});

export default class Service {
	
	/**
	 * Creates an instance of Service.
	 * 
	 * @param {any} namespace	namespace of service (without trailing '/')
	 * @param {any} vm			vm of parent Vue component. It's need to access to $socket
	 * 
	 * @memberOf Service
	 */
	constructor(namespace, vm, socketOpts) {
		if (vm)
			this.socket = vm.$socket;
		else
			this.socket = IO(socketOpts);

		this.namespace = namespace;
		this.axios = axios.create({
			baseURL: `/api/${namespace}/`,
			responseType: "json"
		});
	}

	/**
	 * Call a service action via REST API
	 * 
	 * @param {any} action	name of action
	 * @param {any} params	parameters to request
	 * @returns	{Promise}
	 * 
	 * @memberOf Service
	 */
	rest(action, params) {
		return new Promise((resolve, reject) => {
			this.axios.request(action, {
				method: "post",
				data: params
			}).then((response) => {
				if (response.data && response.data.data)
					resolve(response.data.data);
				else
					reject(response);
			}).catch((error) => {
				if (error.response && error.response.data && error.response.data.error) {
					console.error("REST request error!", error.response.data.error);
					reject(error.response.data.error);
				} else
					reject(error);
			});
		});
	}

	/**
	 * Call a service action via Websocket
	 * 
	 * @param {any} action	name of action
	 * @param {any} params	parameters to request
	 * @returns	{Promise}
	 * 
	 * @memberOf Service
	 */
	emit(action, params) {
		return new Promise((resolve, reject) => {

			this.socket.emit(`/${this.namespace}/${action}`, params, (response) => {

				//console.log("Response: ", response);
				if (response && response.status == 200)
					resolve(response.data);
				else {
					console.error("Socket emit error!", response.error);
					reject(response.error);
				}
			});
			
		});
	}

	/* 
		Example:
			window.counterService.query(gql`query($code: String!) {post(code: $code) { code title } }`, { code: "Jk8Pqb5MAN" })
	*/

	/**
	 * Call a service action via GraphQL query
	 * 
	 * @param {any} query 		GraphQL query string
	 * @param {any} variables 	variables of query
	 * @param {any} fragments	fragments of query
	 * @returns {Promise}
	 * 
	 * @memberOf Service
	 */
	query(query, variables, fragments) {
		return apolloClient.query({
			query,
			variables,
			fragments,
			forceFetch: true
		}).then( (result) => {
			// console.log("GraphQL response: ", result);

			return result.data;
		}).catch( (error) => {
			// console.error("GraphQL query error", error);

			let err = error;
			if (error.graphQLErrors && error.graphQLErrors.length > 0) 
				err = error.graphQLErrors[0];

			throw err;
		});
	}

	// under dev
	watchQuery(query, variables, fragments, pollInterval) {
		return apolloClient.watchQuery({
			query,
			variables,
			fragments, 
			pollInterval,
			forceFetch: true,
		});
	}


	/**
	 * Call a service action via GraphQL mutation
	 * 
	 * @param {any} mutation 	GraphQL mutation string
	 * @param {any} variables 	variables of query
	 * @param {any} fragments	fragments of query
	 * @returns {Promise}
	 * 
	 * @memberOf Service
	 */
	mutate(mutation, variables, fragments) {
		return apolloClient.mutate({
			mutation,
			variables,
			fragments
		}).then( (result) => {
			//console.log("GraphQL response: ", result);

			return result.data;
		}).catch( (error) => {
			//console.error("GraphQL query error", error);

			let err = error;
			if (error.graphQLErrors && error.graphQLErrors.length > 0) 
				err = error.graphQLErrors[0];

			throw err;
		});
	}
}