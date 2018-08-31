"use strict";

let winston = require("winston");
let path = require("path");
let fs = require("fs");
let mkdirp = require("mkdirp");

let config = require("../config");

let	transports = [];

/**
 * Console transporter
 */
transports.push(new winston.transports.Console({
	level: config.logging.console.level,
	colorize: true,
	prettyPrint: true,
	handleExceptions: process.env.NODE_ENV === "production"
}));

/**
 * Logentries transporter
 *
 * https://logentries.com/
 */
if (config.logging.logentries.enabled && config.logging.logentries.token) {
	console.log("Logentries log transport enabled!");
	let Logentries = require("le_node");
	transports.push(new winston.transports.Logentries({
		level: "debug",
		token: config.logging.logentries.token
	}));
}

/**
 * Papertrail transporter
 *
 * https://papertrailapp.com/
 */
if (config.logging.papertrail.enabled) {
	console.log("Papertrail log transport enabled!");
	require("winston-papertrail").Papertrail;

	let ptTransport = new winston.transports.Papertrail(config.logging.papertrail);

	/*ptTransport.on("error", function(err) {
		console.error(err);
	});

	ptTransport.on("connect", function(msg) {
		console.warn(msg);
	});
	*/

	transports.push(ptTransport);
}

/**
 * File transporter
 */
if (config.logging.file.enabled) {

	// Create logs directory
	let logDir = config.logging.file.path;
	if (!fs.existsSync(logDir)) {
		mkdirp(logDir);
	}

	transports.push(new (require("winston-daily-rotate-file"))({
		filename: path.join(logDir, "server.log"),
		level: config.logging.file.level || "info",
		timestamp: true,
		json: config.logging.file.json || false,
		handleExceptions: true
	}));

	if (config.logging.file.exceptionFile) {
		transports.push(new winston.transports.File({
			filename: path.join(logDir, "exceptions.log"),
			level: "error",
			timestamp: true,
			json: config.logging.file.json || false,
			prettyPrint: true,
			handleExceptions: true,
			humanReadableUnhandledException: true
		}));
	}
}

let logger = winston.createLogger({
	level: "debug",
	transports: transports,
	exitOnError: false
});

/**
 * Loggly transporter
 *
 * https://www.loggly.com/
 */
if (config.logging.loggly.enabled && config.logging.loggly.token) {
	console.log("Loggly log transport enabled!");
	let loggly = require("winston-loggly-bulk");
	logger.add(winston.transports.Loggly, {
		inputToken: config.logging.loggly.token,
		subdomain: config.logging.loggly.subdomain,
		tags: ["vem-server"],
		json:true
	});
}

/**
 * Logsene transporter
 *
 * https://sematext.com/logsene/
 */
if (config.logging.logsene.enabled && config.logging.logsene.token) {
	console.log("Logsene log transport enabled!");
	let logsene = require("winston-logsene");
	logger.add(logsene, {
		type: "vem-server",
		token: config.logging.logsene.token
	});
}

/**
 * Logz.io transporter
 *
 * https://sematext.com/logsene/
 */
if (config.logging.logzio.enabled && config.logging.logzio.token) {
	console.log("Logz.io log transport enabled!");
	let logzio = require("winston-logzio");
	logger.add(logzio, {
		token: config.logging.logzio.token
	});
}

/**
 * Graylog transporter
 *
 * https://www.graylog.org/
 */
if (config.logging.graylog.enabled) {
	console.log("Graylog log transport enabled! Servers: " + JSON.stringify(config.logging.graylog.servers));
	let graylog = require("winston-graylog2");
	logger.add(graylog, {
		name: "Graylog",
		level: "debug",
		graylog: {
			servers: config.logging.graylog.servers,
			facility: "vem"
		}
	});
}


module.exports = logger;
