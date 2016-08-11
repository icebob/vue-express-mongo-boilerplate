"use strict";

let Hashids = require("hashids");
let secrets = require("../core/secrets");

module.exports = function(module, length) {
	return new Hashids(module + secrets.hashSecret, length || 10);
}
