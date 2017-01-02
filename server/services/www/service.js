"use strict";

let logger 		= require("../../core/logger");
let config 		= require("../../config");

module.exports = {
	name: "www",

	// Exposed actions
	actions: {

	},

	// Event listeners
	events: {

	},

	// Service methods
	methods: {

	},

	created() {
		this.db	= require("../../core/mongo")();
		this.app = require("./express")(this.db);
		this.logger.info("Service created!");
	},

	started() {
		// this.logger.info("Service started!");
		this.app.listen(config.port, config.ip, function() {
			require("../../libs/sysinfo")();
		});
	
	},

	stopped() {
		// this.logger.info("Service stopped!");
	}
};
