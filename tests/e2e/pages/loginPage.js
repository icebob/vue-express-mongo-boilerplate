"use strict";

let commands = {
	login(username, password) {
		return this
			.waitForElementVisible('@usernameField', 10000)
			.setValue("@usernameField", username)
			.setValue("@passwordField", password)
			.makeScreenshot()
			.click("@submitButton");
	}
};

module.exports = {
	url() {
		return "http://localhost:" + this.client.options.appPort + "/login";
	},

	commands: [commands],

	elements: {
		usernameField: "form #username",
		passwordField: "form #password",
		submitButton: "form [type=submit]"
	}

}