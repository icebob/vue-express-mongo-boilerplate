"use strict";

import { expect } from "chai";

import app from "../load-server";
import Nightmare from "nightmare";

describe("test login page", function() {

	it("should jump to main page after login", function(done) {
		let nightmare = Nightmare({ show: true });
		nightmare
			.goto("http://localhost:3000/login")
			.type("form #username", "test")
			.type("form #password", "test1234")
			.click("form [type=submit]")
			.wait("#app")
			.evaluate(function () {
				return document.querySelector("#app h2").textContent;
			})
			.run(function(error, result) {
				expect(error).to.be.null;
				expect(result).to.be.equal("Home page");
				done();
			});
	});
});