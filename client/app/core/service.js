import axios from "axios";

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
}