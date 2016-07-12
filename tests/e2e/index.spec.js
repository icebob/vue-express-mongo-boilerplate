"use strict";

import { expect } from "chai";

import request from "supertest";
import app from "../load-server";

describe("GET /", () => {
	it("should return 200 OK", (done) => {
		request(app)
			.get("/")
			.expect(200, done);
	});
});

describe("GET /login", () => {
	it("should return 200 OK", (done) => {
		request(app)
			.get("/login")
			.expect(200, done);
	});
});

describe("GET /signup", () => {
	it("should return 200 OK", (done) => {
		request(app)
			.get("/signup")
			.expect(200, done);
	});
});

describe("GET /random-url", () => {
	it("should return 404", (done) => {
		request(app)
			.get("/reset")
			.expect(404, done);
	});
});

describe("GET /reset", () => {
	it("should return 200 OK", (done) => {
		request(app)
			.get("/reset")
			.expect(404, done);
	});
});

describe("GET /forgot", () => {
	it("should return 200 OK", (done) => {
		request(app)
			.get("/forgot")
			.expect(200, done);
	});
});
