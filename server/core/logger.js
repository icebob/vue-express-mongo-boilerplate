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

if (secrets.logentries && secrets.logentries.token) {
	let Logentries = require('le_node');
	transports.push(new winston.transports.Logentries({
		level: "debug",
		token: secrets.logentries.token
	}));
}

if (config.logging.papertrail.enabled) {
	require("winston-papertrail").Papertrail;

	let ptTransport = new winston.transports.Papertrail(config.logging.papertrail);

	console.log("Add Papertrail transport");
	ptTransport.on("error", function(err) {
		console.error(err);
	});

	ptTransport.on("connect", function(msg) {
		console.warn(msg);
	});

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

if (secrets.loggly && secrets.loggly.token) {
	let loggly = require("winston-loggly-bulk");
	logger.add(winston.transports.Loggly, {
		inputToken: secrets.loggly.token,
		subdomain: secrets.loggly.subdomain,
		tags: ["vem-server"],
		json:true
	});
}

if (secrets.logsene && secrets.logsene.token) {
	let logsene = require('winston-logsene');
	logger.add(logsene, {
		type: "vem-server",
		token: secrets.logsene.token
	});
}

if (secrets.logzio && secrets.logzio.token) {
	let logzio = require('winston-logzio');
	logger.add(logzio, {
		token: secrets.logzio.token
	});
}

if (config.logging.graylog.enabled) {
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
