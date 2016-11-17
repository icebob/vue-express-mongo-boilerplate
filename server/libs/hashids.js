"use strict";

let Hashids = require("hashids");
let config = require("../config");

module.exports = function(module, length) {
	return new Hashids(module + config.hashSecret, length || 10);
};
