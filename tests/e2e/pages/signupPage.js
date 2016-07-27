"use strict";

let commands = {
	signup(name, email, username, password, passwordless) {
		return this
			.waitForElementVisible('@emailField', 10000)
			.assert.containsText("@title", "SIGN UP")
			.assert.elementPresent("@nameField")
			.assert.elementPresent("@emailField")
			.assert.elementPresent("@usernameField")
			.assert.elementPresent("@passwordField")
			.assert.elementPresent("@passwordLessCheck")
			.setValue("@nameField", name)
			.setValue("@emailField", email)
			.setValue("@usernameField", username)
			.setValue("@passwordField", password)
			.setValue("@passwordLessCheck", passwordless)
			.makeScreenshot()
			.click("@submitButton");
	}
};

module.exports = {
	url() {
		return this.client.api.options.baseURL + "/signup";
	},

	commands: [commands],

	elements: {
		title: "form header",
		nameField: "form #name",
		emailField: "form #email",
		usernameField: "form #username",
		passwordField: "form #password",
		passwordLessCheck: "form #passwordless",
		submitButton: "form [type=submit]",

		flashError: ".flash .alert-danger div",
		flashInfo: ".flash .alert-success div"
	}

}