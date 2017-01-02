"use strict";

global.WEBPACK_BUNDLE = false;

let config		= require("./config");
let logger 		= require("./core/logger");
let moment 		= require("moment");
let chalk 		= require("chalk");

logger.info();
logger.info(chalk.bold("---------------------[ Server starting at %s ]---------------------------"), moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
logger.info();

logger.info(chalk.bold("Application root path: ") + global.rootPath);

let init		= require("./core/init");
let db			= require("./core/mongo")();
let broker		= require("./core/broker");
broker.start();

require("./libs/gracefulExit");