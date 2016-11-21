"use strict";

let mailtrap = require("../../util/mailtrap");

let pauseTime = 100;

describe("Test login page with username and password", () => {

	let loginPage;
	let homePage;

	let baseURL;

	before((browser, done) => {
		baseURL = 'http://localhost:' + browser.globals.test_settings.appPort;
		browser.options.baseURL = baseURL;
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
			.assert.elementPresent("@flashError")
			.assert.containsText("@flashError", "Unknow username or e-mail")
			.api.pause(pauseTime)
			.makeScreenshot();
	});

	it("should give error, if password is invalid", (browser) => {
		loginPage.navigate()
			.login("test", "1234567")
			.waitForElementPresent(".flash")
			.assert.elementPresent("@flashError")
			.assert.containsText("@flashError", "Invalid password")
			.api.pause(pauseTime)
			.makeScreenshot();
	});

	it("should jump to main, if credentials correct", (browser) => {
		loginPage.navigate()
			.login("test", "test1234")
			.api.pause(pauseTime)
			.makeScreenshot();

		homePage
			.waitForElementVisible("@title")
			.assert.urlEquals(homePage.url())
			.assert.containsText("@title", "Style guide")
			.makeScreenshot();
	});

	it("should jump to index, after logout", (browser) => {
		// Logout
		browser.url(baseURL + "/logout")
			.waitForElementVisible(".page h1")
			.assert.urlEquals(baseURL + "/")
			.assert.elementPresent(".page h1")
			.pause(pauseTime)
			.makeScreenshot();
	});

});

describe("Test login page with passwordless", () => {

	let loginPage;
	let homePage;

	let baseURL;

	before((browser, done) => {
		baseURL = 'http://localhost:' + browser.globals.test_settings.appPort;
		loginPage = browser.page.loginPage();
		homePage = browser.page.homePage();
		done();
	});

	after((browser, done) => {
		browser.end(() => {
			//mailtrap.cleanInbox();

			done();
		});
	});

	it("should give passwordless info, if password is empty", (browser) => {
		loginPage.navigate()
			.login("test", "")
			.waitForElementPresent("@flashInfo")
			.assert.elementPresent("@flashInfo")
			.api.pause(pauseTime)
			.assert.urlEquals(loginPage.url())
			.makeScreenshot();

		browser
			.pause(1000) // Wait for email received
			.perform(function(browser, done) {
				console.log("Check mailbox...");

				let re = /passwordless\/(\w+)/g;			
				mailtrap.getTokenFromMessage("test@boilerplate-app.com", re, function(err, token, message) {
					if (err) 
						throw new Error(err);

					// Delete message
					mailtrap.deleteMessage(null, message.id);

					//console.log("Open magic link: " + baseURL + "/passwordless/" + token);
					browser.url(baseURL + "/passwordless/" + token);

					return done();
				});

				return this;
			})
			.pause(pauseTime);

		homePage
			.waitForElementVisible("@title")
			.assert.urlEquals(homePage.url())
			.assert.containsText("@title", "Style guide")
			.makeScreenshot()
			.logout();

	});	

});