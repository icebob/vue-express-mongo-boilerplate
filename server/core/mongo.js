"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let Promise			= require("bluebird");
let chalk 			= require("chalk");
let mongoose 		= require("mongoose");
let autoIncrement 	= require("mongoose-auto-increment");

let db;

module.exports = function() {
	mongoose.Promise = Promise;
	if (!db) {
		logger.info("Connecting to Mongo " + config.db.uri + "...");
		db = mongoose.connect(config.db.uri, config.db.options, function mongoAfterConnect(err) {
			if (err) {
				logger.error("Could not connect to MongoDB!");
				return logger.error(err);
			}
		
			mongoose.set("debug", config.isDevMode());
		});

		mongoose.connection.on("error", function mongoConnectionError(err) {
			if (err.message.code === "ETIMEDOUT") {
				logger.warn("Mongo connection timeout!", err);
				setTimeout(() => {
					mongoose.connect(config.db.uri, config.db.options);
				}, 1000);
				return;
			}

			logger.error("Could not connect to MongoDB!");
			return logger.error(err);
		});

		/*
			Maybe change to 
				https://github.com/icebob/mongoose-autoincrement

		 */
		autoIncrement.initialize(db);		

		mongoose.connection.once("open", function mongoAfterOpen() {
			logger.info(chalk.yellow.bold("Mongo DB connected."));
			logger.info();

			if (config.isTestMode()) {
				logger.warn("Drop test database...");
				//mongoose.connection.db.dropDatabase((err) => {
				//	autoIncrement.initialize(db);
				require("./seed-db")();		
				//);
			}
			else {
				if (!config.isProduction) {
					require("./seed-db")();	
				}
			}
		});

		
	} else {
		logger.info("Mongo already connected.");
		db = mongoose;
	}
	
	return db;
};
