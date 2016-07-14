"use strict";

describe("Test login page", () => {

	let loginPage;
	let homePage;

	let appPort;

	before((browser, done) => {
		appPort = browser.globals.test_settings.appPort;
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
			.assert.containsText(".flash .alert-danger div", "Unknow username or e-mail")
			.api.pause(1000)
			.makeScreenshot();
	});

	it("should give error, if password is invalid", (browser) => {
		loginPage.navigate()
			.login("test", "1234567")
			.waitForElementPresent(".flash")
			.assert.elementPresent(".flash .alert-danger")
			.assert.containsText(".flash .alert-danger div", "Invalid password")
			.api.pause(1000)
			.makeScreenshot();
	});

	it("should jump to main, if credentials correct", (browser) => {
		loginPage.navigate()
			.login("test", "test1234");

		homePage
			.waitForElementVisible("@title")
			.assert.urlEquals('http://localhost:' + appPort + "/#!/")
			.assert.containsText("@title", "Home")
			.makeScreenshot();
	});

});