"use strict";

let TokenGenerator = require("uuid-token-generator");
let tokgen = new TokenGenerator(256, TokenGenerator.BASE62);

/**
 * Generate token/keys
 * We use it to generate APIKEY to users
 */
module.exports = function() {
	return tokgen.generate();
};