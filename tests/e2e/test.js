"use strict";

import { expect } from "chai";

//import app from "../load-server";
import Nightmare from "nightmare";

describe('test yahoo search results', function() {

	let nightmare;

	beforeEach( () => {
		nightmare = Nightmare( { show: true });
	});

	it('should find the nightmare github link first', function(done) {
		var nightmare = Nightmare()
		nightmare
			.goto('http://yahoo.com')
			.type('form[action*="/search"] [name=p]', 'github nightmare')
			.click('form[action*="/search"] [type=submit]')
			.wait('#main')
			.evaluate(function () {
				return document.querySelector('#main .searchCenterMiddle li a').href
			})
			.end()
			.then(function(link) {
				expect(link).to.equal('https://github.com/segmentio/nightmare');
				done();
			})
	});
});