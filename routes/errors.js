"use strict";

let config  = require("../config");
let logger  = require('../core/logger');

module.exports = function(app) {

	if (config.isDevMode()) {
		app.use(function(err, req, res, next) {
			if (!err) {
				return next();
			}
			logger.error(err.stack);
			return res.status(err.status || 500).render('500', {
				error: err
			});
		});
	}

	app.use(function(req, res) {
		var err;
		err = new Error('404 Page Not Found');
		err.status = 404;
		logger.warn("404 error! URL:", req.url);
		return res.status(404).render('404', {
			url: req.originalUrl,
			error: err
		});
	});

};
