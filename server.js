"use strict";

let config		= require("./config");
let logger 		= require('./core/logger');
let moment 		= require('moment');

logger.info();
logger.info("---------------------[ Server starting at %s ]---------------------------", moment().format("YYYY-MM-DD HH:mm:ss.SSS"));

let init		= require("./core/init");
let db 			= require('./core/mongo')();
let app 		= require('./core/express')(db);
let agenda 		= require('./core/agenda');

require("./libs/gracefulExit");

app.listen(config.port, function() {

	logger.info('');
	logger.info(config.app.title + " v" + config.app.version + ' application started!');
	logger.info('----------------------------------------------');
	logger.info('Environment:\t' + process.env.NODE_ENV);
	logger.info('IP:\t\t' + config.ip);
	logger.info('Port:\t\t' + config.port);
	logger.info('Database:\t\t' + config.db.uri);
	logger.info('');

	require("./libs/sysinfo")();

	logger.info('----------------------------------------------');

	if (!config.isTestMode())
		return agenda.start();

});


exports = module.exports = app;
