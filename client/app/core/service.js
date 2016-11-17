import axios from "axios";

import gql from "graphql-tag";
import ApolloClient, { createNetworkInterface } from "apollo-client";

window.gql = gql; // debug

const networkInterface = createNetworkInterface({
	uri: "/graphql",
	opts: {
		credentials: "same-origin"
	}
});
/*
networkInterface.use([{
	applyMiddleware(req, next) {
		// Send to back the session ID
		req.options.credentials = "same-origin";
		next();
	}
}]);*/

export default class Service {
	
	/**
	 * Creates an instance of Service.
	 * 
	 * @param {any} namespace	namespace of service (without trailing '/')
	 * @param {any} vm			vm of parent Vue component. It's need to access to $socket
	 * 
	 * @memberOf Service
	 */
	constructor(namespace, vm) {
		this.vm = vm;
		this.namespace = namespace;
		this.axios = axios.create({
			baseURL: `/api/${namespace}/`,
			responseType: "json"
		});

		// Create the apollo client for GraphQL
		this.apolloClient = new ApolloClient({
			networkInterface
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

			this.vm.$socket.emit(`/${this.namespace}/${action}`, params, (response) => {

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

	query(query, variables, fragments) {
		return this.apolloClient.query({
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

	watchQuery(query, variables, fragments, pollInterval) {
		return this.apolloClient.watchQuery({
			query,
			variables,
			fragments, 
			pollInterval,
			forceFetch: true,
		});
	}


	mutate(mutation, variables, fragments) {
		return this.apolloClient.mutate({
			mutation,
			variables,
			fragments
		}).then( (result) => {
			console.log("GraphQL response: ", result);
			/*if (result.errors)
				return console.error("Got some GraphQL execution errors!", result.errors);

			if (result.data) {
				console.log(result.data);
			}*/
		}).catch( (error) => {
			console.error("GraphQL query error", error);

			let err = error;
			if (error.graphQLErrors && error.graphQLErrors.length > 0) 
				err = error.graphQLErrors[0];

			throw err;
		});
	}
}