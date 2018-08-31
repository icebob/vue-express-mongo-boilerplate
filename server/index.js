"use strict";

global.WEBPACK_BUNDLE = false;

let config		= require("./config");
let logger 		= require("./core/logger");
let moment 		= require("moment");
let chalk 		= require("chalk");

logger.info({});
logger.info(chalk.bold("---------------------[ Server starting at %s ]---------------------------"), moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
logger.info({});

logger.info(chalk.bold("Application root path: ") + global.rootPath);

let init		= require("./core/init");
let db 			= require("./core/mongo")();
let app 		= require("./core/express")(db);
let agenda 		= require("./core/agenda");

require("./libs/gracefulExit");

app.listen(config.port, config.ip, function() {

	logger.info("");
	logger.info(config.app.title + " v" + config.app.version + " application started!");
	logger.info("----------------------------------------------");
	logger.info("Environment:\t" + chalk.underline.bold(process.env.NODE_ENV));
	logger.info("IP:\t\t" + config.ip);
	logger.info("Port:\t\t" + config.port);
	logger.info("Database:\t\t" + config.db.uri);
	logger.info("Redis:\t\t" + (config.redis.enabled ? config.redis.uri : "Disabled"));
	logger.info("");

	require("./libs/sysinfo")();

	logger.info("----------------------------------------------");

	let Service = require("./core/services");
	if (config.isDevMode)
		Service.printServicesInfo();
});


exports = module.exports = app;
