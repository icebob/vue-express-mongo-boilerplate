"use strict";

let logger = require("./logger");
let config = require("../config");

let moment = require("moment");
let chalk = require("chalk");
let Agenda = require("agenda");

let User = require("../models/user");

let agenda = new Agenda({
	db: {
		address: config.db.uri,
		collection: "agendaJobs"
	},
	processEvery: config.agendaTimer || "one minute"
});

agenda.on("fail", function(err, job) {
	return logger.error("Job failed with error: " + err.message);
});

/**
 * Remove unverified account after 24 hours
 */

agenda.define("removeUnverifiedAccounts", function(job, done) {
	var error, removeList;
	logger.debug("Running 'removeUnverifiedAccounts' process...");
	try {

		User.remove({ 
			createdAt: {
				$lte: moment().subtract(1, "day").toDate()
			},
			verified: false
		}, (err, count) => {
			if (count > 0)
				logger.warn(chalk.bold.red(count + " unverified and expired account removed!"));

			done();
		});
	} catch (error) {
		logger.error("Job running exception!");
		logger.error(error);
		return done(error);
	}
});

agenda.on('ready', function() {
	if (!config.isTestMode()) {
		agenda.every('8 hours', 'removeUnverifiedAccounts'); 
		agenda.start();
		logger.info(chalk.yellow("Agenda started!"));
	}
});

module.exports = agenda;