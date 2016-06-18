"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');
let path 	= require('path');

module.exports = function(app) {

	// Index page
	app.get('/', function(req, res) {
		return res.render('index', {
			title: config.app.description,
			url: {
				readOnly: "",
				readWrite: ""
			}
		});
	});

	// Handle User CRUD
	require("./user")(app);

	// Handle errors
	require("./errors")(app);	
};
