"use strict";

let os = require("os");
let clui = require("clui");
let pretty = require("pretty-bytes");
let config = require("../config");
let logger = require("../core/logger");
let chalk = require("chalk");

module.exports = function() {

	logger.info("");
	logger.info(config.app.title + " v" + config.app.version + " application started!");
	logger.info("----------------------------------------------");
	logger.info("Environment:\t" + chalk.underline.bold(process.env.NODE_ENV));
	logger.info("IP:\t\t" + config.ip);
	logger.info("Port:\t\t" + config.port);
	logger.info("Database:\t\t" + config.db.uri);
	logger.info("Redis:\t\t" + (config.redis.enabled ? config.redis.uri : "Disabled"));
	logger.info("");

	let Gauge = clui.Gauge;
	let total = os.totalmem();
	let free = os.freemem();
	let used = total - free;
	let human = pretty(free);

	logger.info("CPU:\t\tArch: " + (os.arch()) + ", Cores: " + (os.cpus().length));
	logger.info("Memory:\t\t" + Gauge(used, total, 20, total * 0.8, human + " free"));
	logger.info("OS:\t\t" + (os.platform()) + " (" + (os.type()) + ")");

	logger.info("----------------------------------------------");
	
};
