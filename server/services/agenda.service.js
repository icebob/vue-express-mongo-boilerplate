"use strict";

let config 		= require("../config");

let moment 		= require("moment");
let chalk 		= require("chalk");
let Agenda 		= require("agenda");

module.exports = {
	name: "agenda",

	methods: {
		removeUnverifiedAccounts(job, done) {
			this.logger.debug("Running 'removeUnverifiedAccounts' process...");
			try {
				let User = require("../models/user");
				User.remove({ 
					createdAt: {
						$lte: moment().subtract(1, "day").toDate()
					},
					verified: false
				}, (err, count) => {
					if (count > 0)
						this.logger.warn(chalk.bold.red(count + " unverified and expired account removed!"));

					done();
				});
			} catch (error) {
				this.logger.error("Job running exception!");
				this.logger.error(error);
				return done(error);
			}			
		}
	},

	created() {
		let self = this;
		let agenda = new Agenda({
			db: {
				address: config.db.uri,
				collection: "agendaJobs"
			},
			processEvery: config.agendaTimer || "one minute"
		});

		agenda.on("fail", (err, job) => {
			return this.logger.error("Job failed with error: " + err.message);
		});

		/**
		 * Remove unverified account after 24 hours
		 */
		agenda.define("removeUnverifiedAccounts", this.removeUnverifiedAccounts);

		/**
		 * Starting agenda
		 */
		agenda.on("ready", () => {
			if (config.isTestMode())
				return;

			agenda.every("8 hours", "removeUnverifiedAccounts"); 
			agenda.start();
			self.logger.info(chalk.yellow("Agenda started!"));
		});	

		this.agenda = agenda;	
	},

	started() {
	},

	stopped() {
		this.agenda.stop();
	}
};
