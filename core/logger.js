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

let	transports = [
	new winston.transports.Console({
		level: "debug",
		colorize: true,
		prettyPrint: true,
		handleExceptions: process.env.NODE_ENV === "production"
	})
];

if (process.env.NODE_ENV === "production") {
	transports.push(new (require("winston-daily-rotate-file"))({
		filename: path.join(logDir, "server.log"),
		level: "info",
		timestamp: true,
		json: true,
		handleExceptions: process.env.NODE_ENV === "production"
	}), new winston.transports.File({
		filename: path.join(logDir, "exceptions.log"),
		level: "error",
		timestamp: true,
		json: false,
		prettyPrint: true,
		handleExceptions: process.env.NODE_ENV === "production",
		humanReadableUnhandledException: true
	})
	);	
}

let logger = new winston.Logger({
	level: "debug",
	transports: transports,
	exitOnError: false
});

module.exports = logger;
