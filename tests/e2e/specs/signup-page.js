"use strict";

let mailtrap = require("../../util/mailtrap");
let fakerator = require("fakerator")();

let pauseTime = 100;

describe("Test signup page with password", () => {

	let user = fakerator.entity.user();
	user.name = user.firstName + " " + user.lastName;

	let loginPage;
	let signupPage;
	let homePage;

	let baseURL;

	before((browser, done) => {
		baseURL = "http://localhost:" + browser.globals.test_settings.appPort;
		browser.options.baseURL = baseURL;
		signupPage = browser.page.signupPage();
		loginPage = browser.page.loginPage();
		homePage = browser.page.homePage();
		done();
	});

	after((browser, done) => {
		browser.end(() => {
			done();
		});
	});

	it("should give error, if password is too short", (browser) => {
		signupPage.navigate()
			.signup(user.name, user.email, user.userName, "123", false)
			.waitForElementPresent(".flash")
			.assert.elementPresent("@flashError")
			.assert.containsText("@flashError", "Password must be at least 6 characters long!")
			.api.pause(pauseTime)
			.makeScreenshot();
	});

	it("should accept signup, if every data is good", (browser) => {
		signupPage.navigate()
			.signup(user.name, user.email, user.userName, user.password, false)
			.waitForElementPresent(".flash")
			.assert.elementPresent("@flashInfo")
			.assert.containsText("@flashInfo", "Please check your email to verify your account. Thanks for signing up!")
			.api.pause(pauseTime)
			.assert.urlEquals(loginPage.url())
			.makeScreenshot();

		browser
			.pause(1000) // Wait for email received
			.perform(function(browser, done) {
				//console.log("Check mailbox...");

				let re = /verify\/(\w+)/g;			
				mailtrap.getTokenFromMessage(user.email, re, function(err, token, message) {
					if (err) 
						throw new Error(err);

					// Delete message
					mailtrap.deleteMessage(null, message.id);

					//console.log("Open verify link: " + baseURL + "/verify/" + token);
					browser.url(baseURL + "/verify/" + token);

					return done();
				});

				return this;
			})
			.pause(pauseTime);

		// Check the user redirected to main app
		homePage
			.waitForElementVisible("@title")
			.assert.urlEquals(homePage.url())
			.assert.containsText("@title", "Style guide")
			.makeScreenshot()
			.logout();
	});	

	it("should login with email & password", (browser) => {
		loginPage.navigate()
			.login(user.email, user.password)
			.api.pause(pauseTime)
			.makeScreenshot();

		// Check the user redirected to main app
		homePage
			.waitForElementVisible("@title")
			.assert.urlEquals(homePage.url())
			.assert.containsText("@title", "Style guide")
			.makeScreenshot()
			.logout();
	});	

	it("should login with username & password", (browser) => {
		loginPage.navigate()
			.login(user.userName, user.password)
			.api.pause(pauseTime)
			.makeScreenshot();

		// Check the user redirected to main app
		homePage
			.waitForElementVisible("@title")
			.assert.urlEquals(homePage.url())
			.assert.containsText("@title", "Style guide")
			.makeScreenshot()
			.logout();

	});			

});

describe.only("Test signup page with passwordless mode", () => {

	let user = fakerator.entity.user();
	user.name = user.firstName + " " + user.lastName;

	let loginPage;
	let signupPage;
	let homePage;

	let baseURL;

	before((browser, done) => {
		baseURL = "http://localhost:" + browser.globals.test_settings.appPort;
		browser.options.baseURL = baseURL;
		signupPage = browser.page.signupPage();
		loginPage = browser.page.loginPage();
		homePage = browser.page.homePage();
		done();
	});

	after((browser, done) => {
		browser.end(() => {
			done();
		});
	});

	it("should accept signup, if we check the passwordless mode", (browser) => {
		signupPage.navigate()
			.signup(user.name, user.email, user.userName, "", true)
			.waitForElementPresent(".flash")
			.assert.elementPresent("@flashInfo")
			.assert.containsText("@flashInfo", "Please check your email to verify your account. Thanks for signing up!")
			.api.pause(pauseTime)
			.assert.urlEquals(loginPage.url())
			.makeScreenshot();

		browser
			.pause(1000) // Wait for email received
			.perform(function(browser, done) {
				//console.log("Check mailbox...");

				let re = /verify\/(\w+)/g;			
				mailtrap.getTokenFromMessage(user.email, re, function(err, token, message) {
					if (err) 
						throw new Error(err);

					// Delete message
					mailtrap.deleteMessage(null, message.id);

					//console.log("Open verify link: " + baseURL + "/verify/" + token);
					browser.url(baseURL + "/verify/" + token);

					return done();
				});

				return this;
			})
			.pause(pauseTime);

		// Check the user redirected to main app
		homePage
			.waitForElementVisible("@title")
			.assert.urlEquals(homePage.url())
			.assert.containsText("@title", "Style guide")
			.makeScreenshot()
			.logout();
	});	

	it("should give error if login with password", (browser) => {
		loginPage.navigate()
			.login(user.email, user.password)
			.waitForElementPresent(".flash")
			.assert.elementPresent("@flashError")
			.assert.containsText("@flashError", "This is a passwordless account!")
			.api.pause(pauseTime)
			.makeScreenshot();
	});	
	
	it("should login with username & w/o password", (browser) => {
		loginPage.navigate()
			.login(user.userName, "")
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
				mailtrap.getTokenFromMessage(user.email, re, function(err, token, message) {
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

	it("should login with email & w/o password", (browser) => {
		loginPage.navigate()
			.login(user.email, "")
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
				mailtrap.getTokenFromMessage(user.email, re, function(err, token, message) {
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
