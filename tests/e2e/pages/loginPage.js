"use strict";

let path = require("path");

let commands = {
	login(username, password) {
		return this
			.waitForElementVisible('@usernameField', 10000)
			.setValue("@usernameField", "test")
			.setValue("@passwordField", "test1234")
			//.saveScreenshot(path.join(this.api.screenshotsPath, "login.png"))
			.click("@submitButton");
	}
};

module.exports = {
	url() {
		return "http://localhost:" + this.client.options.appPort+ "/login";
	},

	commands: [commands],

	elements: {
		usernameField: "form #username",
		passwordField: "form #password",
		submitButton: "form [type=submit]"
	}

}