"use strict";

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

	it("should give error, if username is invalid", (browser) => {
		loginPage.navigate()
			.login("johnnn", "johnny")
			.waitForElementPresent(".flash")
			.assert.elementPresent(".flash .alert-danger")
			.makeScreenshot();
	});

	it("should give error, if password is invalid", (browser) => {
		loginPage.navigate()
			.login("test", "1234567")
			.waitForElementPresent(".flash")
			.assert.elementPresent(".flash .alert-danger")
			.makeScreenshot();
	});

	it("should jump to main, if credentials correct", (browser) => {
		loginPage.navigate()
			.login("test", "test1234");

		homePage
			.waitForElementVisible("@title")
			.assert.urlEquals('http://localhost:' + browser.globals.test_settings.appPort + "/#!/")
			.assert.containsText("@title", "Kezdőlap")
			.makeScreenshot();
	});

});