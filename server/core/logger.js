"use strict";

let winston = require("winston");
let path = require("path");
let fs = require("fs");

let config = require("../config");
let secrets = require("./secrets");

// Create logs directory
let logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
	fs.mkdir(logDir, (err) => {
		if (err)
			throw err;
	});
}

let	transports = [
	new winston.transports.Console({
		level: "debug",
		colorize: true,
		prettyPrint: true,
		handleExceptions: process.env.NODE_ENV === "production"
	})
];

if (config.logging.logentries.enabled && config.logging.logentries.token) {
	console.log("Logentries log transport enabled!");
	let Logentries = require('le_node');
	transports.push(new winston.transports.Logentries({
		level: "debug",
		token: config.logging.logentries.token
	}));
}

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

if (process.env.NODE_ENV === "production") {
	transports.push(
		new (require("winston-daily-rotate-file"))({
			filename: path.join(logDir, "server.log"),
			level: "info",
			timestamp: true,
			json: true,
			handleExceptions: true
		}), new winston.transports.File({
			filename: path.join(logDir, "exceptions.log"),
			level: "error",
			timestamp: true,
			json: false,
			prettyPrint: true,
			handleExceptions: true,
			humanReadableUnhandledException: true
		})
	);	
}

let logger = new winston.Logger({
	level: "debug",
	transports: transports,
	exitOnError: false
});

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

if (config.logging.logsene.enabled && config.logging.logsene.token) {
	console.log("Logsene log transport enabled!");
	let logsene = require('winston-logsene');
	logger.add(logsene, {
		type: "vem-server",
		token: config.logging.logsene.token
	});
}

if (config.logging.logzio.enabled && config.logging.logzio.token) {
	console.log("Logz.io log transport enabled!");
	let logzio = require('winston-logzio');
	logger.add(logzio, {
		token: config.logging.logzio.token
	});
}

if (config.logging.graylog.enabled) {
	console.log("Graylog log transport enabled! Servers: " + JSON.stringify(config.logging.graylog.servers));
	let graylog = require("winston-graylog2");
	logger.add(graylog, {
		name: "Graylog",
		level: 'debug',
		graylog: {
			servers: config.logging.graylog.servers,
			facility: "vem"
		}
	});
}


module.exports = logger;
