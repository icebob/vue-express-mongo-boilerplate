"use strict";

let winston = require("winston");
let path = require("path");
let fs = require("fs");

// Create logs directory
let logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
	fs.mkdir(logDir, (err) => {
		if (err)
			throw err;
	});
}

let logger = new winston.Logger({
	level: "debug",
	transports: [
		new winston.transports.Console({
			level: "debug",
			colorize: true,
			prettyPrint: true,
			handleExceptions: process.env.NODE_ENV === 'production'
		}), new (require('winston-daily-rotate-file'))({
			filename: path.join(logDir, "server.log"),
			level: "info",
			timestamp: true,
			json: true,
			handleExceptions: process.env.NODE_ENV === 'production'
		}), new winston.transports.File({
			filename: path.join(logDir, "exceptions.log"),
			level: "error",
			timestamp: true,
			json: false,
			prettyPrint: true,
			handleExceptions: process.env.NODE_ENV === 'production'
		})
	],
	exitOnError: false
});

module.exports = logger;
