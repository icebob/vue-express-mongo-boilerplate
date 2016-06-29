"use strict";

let logger = require("./logger");
let config = require("../config");

let Agenda = require("agenda");

let agenda = new Agenda({
	db: {
		address: config.db.uri,
		collection: "agendaJobs"
	},
	processEvery: "10 seconds"
});

agenda.on("fail", function(err, job) {
	return logger.error("Job failed with error: " + err.message);
});

module.exports = agenda;