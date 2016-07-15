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
		return "http://localhost:" + this.client.options.appPort + "/#!/";
	},

	commands: [commands],

	elements: {
		title: "#app h2"
	}
}