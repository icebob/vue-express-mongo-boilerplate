"use strict";

import { expect } from "chai";

import request from "supertest";
import app from "./load-server";

describe('GET /reset', () => {
	it('should return 200 OK', (done) => {
		request(app)
			.get('/reset')
			.expect(404, done);
	});
});

describe('GET /forgot', () => {
	it('should return 200 OK', (done) => {
		request(app)
			.get('/forgot')
			.expect(200, done);
	});
});
