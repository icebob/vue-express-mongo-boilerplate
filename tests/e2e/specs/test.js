"use strict";

// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

let path = require("path");

// Example: https://github.com/lovedota/nightwatch-01/blob/fbef664e801d9efaa04b5f618f6bf5cfe79bce46/pages/loginPage.js

let port = process.env.APP_PORT || process.env.PORT || 3000;
let screenshotFolder = path.join(__dirname, "..", "reports", "screenshots");

describe("Test login page", () => {

	let loginPage;
	let homePage;

	before((browser, done) => {
		loginPage = browser.page.loginPage();
		homePage = browser.page.homePage();
		done();
	});

	after((browser, done) => {
		browser.end(() => {
			done();
		});
	});

	it("login with 'test' user", (browser) => {
			loginPage.navigate()
				.login("test", "test1234");

			homePage
				.waitForElementVisible("@title")
				.assert.urlEquals('http://localhost:' + port + "/#!/")
				.assert.containsText("@title", "Kezdőlap")
				.makeScreenshot("main.png");
	});

});