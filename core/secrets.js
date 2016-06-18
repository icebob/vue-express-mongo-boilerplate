"use strict";

let logger 	= require('./logger');
let fs		= require('fs');
let path		= require("path");
let secretUtils	= require("secret-utils");

let fName = path.join(__dirname, "..", "secrets.json");
if (!fs.existsSync(fName)) {
	let json = {
		hashSecret: secretUtils.url64(32)
	}
	fs.writeFileSync(fName, JSON.stringify(json, null, 2));
	logger.info("\x1b[33;1mSecret file created!\x1b[22;39m");
}

module.exports = require("../secrets.json");
