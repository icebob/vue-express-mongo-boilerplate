"use strict";

let path = require("path");

module.exports.command = function(fileName) {
	this.saveScreenshot(path.join(this.screenshotsPath, fileName));
	return this;
}