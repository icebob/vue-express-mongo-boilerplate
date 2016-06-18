"use strict";

let logger 	= require('../core/logger');
let config	= require('../config');
let fs		= require('fs');

// Create data folder if not exist
if (!fs.existsSync(config.dataFolder)) {
	fs.mkdir(config.dataFolder, (err) => {
		if (err)
			throw err;
	});
}
