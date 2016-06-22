"use strict";

let config  = require("../config");
let logger  = require('../core/logger');

module.exports = function(app, db) {

	if (config.isDevMode()) {
		app.use(function(err, req, res, next) {
			if (!err) {
				return next();
			}

			logger.error(err.stack);
			res.status(err.status || 500);

			 // Respond with html page
			if (req.accepts('html')) {
				return res.render('500', {
					url: req.originalUrl,
					error: err
				});
			}

			// Respond with json
			if (req.accepts('json')) {
				return res.json({ 
					error: {
						code: err.status || 500,
						msg: 'Server error!' 
					}
				});
			}
		});
	}

	app.use(function(req, res) {
		res.status(404);
		logger.warn("404 error! URL:", req.url);

		 // Respond with html page
		if (req.accepts('html')) {
			let err = new Error('404 Page Not Found');
			err.status = 404;
			return res.render('404', {
				url: req.originalUrl,
				error: err
			});
		}

		// Respond with json
		if (req.accepts('json')) {
			return res.json({ 
				error: {
					code: 404,
					msg: 'Not found!'
				} 
			});
		}
	});

};
