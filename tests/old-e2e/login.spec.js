"use strict";

import { expect } from "chai";

import app from "../load-server";
import Nightmare from "nightmare";

let port = app._app.get("port").trim();

describe("test login page", function() {
	let nightmare = Nightmare({ show: true });
	it("should jump to main page after login", function(done) {
		nightmare
			.goto("http://localhost:" + port + "/login")
			.type("form #username", "test")
			.type("form #password", "test1234")
			.click("form [type=submit]")
			.wait("#app h2")
			.evaluate(function () {
				return document.querySelector("#app h2").textContent;
			})
			.run(function(error, result) {
				if (error) 
					console.log(error);

				expect(error).to.be.null;
				expect(result).to.be.equal("Kezdőlap");
				done();
			});
	});

	/*it("should jump to login page after signup", function(done) {
		nightmare
			.goto("http://localhost:" + port + "/signup")
			.type("form #name", "John Doe")
			.type("form #email", "johndoe@example.com")
			.type("form #username", "johndoe")
			.type("form #password", "johndoePass")
			.click("form [type=submit]")
			.wait(".flash")
			.wait(5000)
			.evaluate(function () {
				return document.querySelector(".flash").textContent;
			})
			.run(function(error, result) {
				if (error) 
					console.log(error);

				expect(error).to.be.null;
				expect(result).to.be.equal("");
				done();
			});
	});*/

});