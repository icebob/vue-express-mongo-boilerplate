"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let chalk 			= require("chalk");
let	Redis 			= require("ioredis");

// Redis client instance
let client;

if (config.redis.enabled) {
	client = new Redis(config.redis.uri);

	client.on("connect", (err) => {
		logger.info(chalk.green.bold("Redis client connected!"));
	});
	
	client.on("error", (err) => {
		logger.error(err);
	});

	if (config.isDevMode()) {
		client.monitor((err, monitor) => {
			logger.debug("Redis entering monitoring mode...");
			monitor.on("monitor", (time, args, source, database) => {
				logger.debug("REDIS: ", args);
			});
		});
	}

}

module.exports = client;
