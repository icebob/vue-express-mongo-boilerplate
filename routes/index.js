"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');
let path 	= require('path');

module.exports = function(app, db) {

	// Index page
	app.get('/', function(req, res) {
		if (req.user != null)
			res.render('main', {
				user: req.user
			});
		else
			res.render('index');
	});

	// Handle account routes
	require("./account")(app, db);

	// Handle Auth routes
	require("./auth")(app, db);

	// Handle User CRUD
	require("./user")(app, db);

	// Handle errors
	require("./errors")(app, db);	
};
