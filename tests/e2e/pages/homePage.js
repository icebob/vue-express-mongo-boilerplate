"use strict";

let commands = {
	logout() {
		return this
			.client.api.url("http://localhost:" + this.client.options.appPort + "/logout")
			.waitForElementVisible(".page h1");
	}
};

module.exports = {
	url() {
		return this.client.api.options.baseURL + "/#!/";
	},

	commands: [commands],

	elements: {
		title: "#app h1"
	}
};
