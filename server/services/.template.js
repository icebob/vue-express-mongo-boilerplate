"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");
let E 			= require("../../../core/errors");

module.exports = {
	name: "",
	version: 1,

	settings: {
		latestVersion: true,
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN
	},

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
		// this.logger.info("Service created!");
	},

	started() {
		// this.logger.info("Service started!");
	},

	stopped() {
		// this.logger.info("Service stopped!");
	}
};
