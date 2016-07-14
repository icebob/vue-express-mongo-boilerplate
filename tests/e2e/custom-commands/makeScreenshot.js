"use strict";

let path = require("path");

module.exports.command = function(title) {
	//console.log(this);
	let prefix = this.currentTest.module + '/' + this.currentTest.name + (title ? ("-" + title) : "");
	prefix = prefix.replace(/\s/g, '-').replace(/"|'/g, '');
	this.saveScreenshot(path.join(this.screenshotsPath, prefix + ".png"));
	return this;
}