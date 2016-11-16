import axios from "axios";

module.exports = function(namespace) {

	this.getRESTInterface = function() {
		let request = axios.create({
			baseURL: `/api/${namespace}/`,
			responseType: "json"
		});

		let api = {
			invoke(action, params) {
				return new Promise((resolve, reject) => {
					request.request(action, {
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
		};


		return api;

	};


	return this;
};