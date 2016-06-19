"use strict";

let config 	= require("../config");
let logger 	= require('../core/logger');
let path 	= require('path');

module.exports = function(app) {

	// Index page
	app.get('/', function(req, res) {
		if (req.user != null)
			res.render('main', {
				user: req.user
			});
		else
			res.render('index');
	});

	// Login page
	app.get('/login', function(req, res) {
		if (req.user != null) {
			return res.redirect("/");
		}
		res.render('login');
	});

	// Logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect("/");
	});

	// Handle Auth routes
	require("./auth")(app);

	// Handle User CRUD
	require("./user")(app);

	// Handle errors
	require("./errors")(app);	
};
