"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let chalk 			= require("chalk");
let	Redis 			= require("redis");

// Redis client instance
let client;

if (config.redis.enabled) {
	client = Redis.createClient(config.redis.uri);

	client.on("connect", (err) => {
		logger.info(chalk.green.bold("Redis client connected!"));
	});
	
	client.on("error", (err) => {
		logger.error(err);
	});

	if (config.isDevMode()) {
		client.monitor((err, res) => {
			logger.debug("Redis entering monitoring mode...");
		});

		client.on("monitor", (time, args, raw_reply) => {
			logger.debug("REDIS: ", args);
		});
	}

}

module.exports = client;
