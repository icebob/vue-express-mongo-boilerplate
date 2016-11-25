"use strict";

let config    		= require("../../config");
let logger    		= require("../logger");
let redis 			= require("../redis");

let _ 				= require("lodash");

let MemoryCacher 	= require("./cacher-memory");
let RedisCacher 	= require("./cacher-redis");

module.exports = function(type, prefix, ttl) {
	switch(type) {
	case "redis": return new RedisCacher(prefix, ttl);
	default: return new MemoryCacher(prefix, ttl);
	}
};
