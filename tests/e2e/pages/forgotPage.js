"use strict";

let commands = {
	submit(email) {
		return this
			.waitForElementVisible('@emailField', 10000)
			.assert.containsText("@title", "FORGOT")
			.assert.elementPresent("@emailField")
			.setValue("@emailField", email)
			.makeScreenshot()
			.click("@submitButton");
	}
};

module.exports = {
	url() {
		return "http://localhost:" + this.client.options.appPort + "/forgot";
	},

	commands: [commands],

	elements: {
		title: "form header",
		emailField: "form #email",
		submitButton: "form [type=submit]",

		flashError: ".flash .alert-danger div",
		flashInfo: ".flash .alert-success div"
		
	}

}