"use strict";

module.exports.isAuthenticated = function(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else
		return res.sendStatus(401);
};

module.exports.hasRole = function(roleRequired) {
	if (!roleRequired)
		throw new Error("Required role needs to be set");

	return function(req, res, next) {
		return isAuthenticated(req, res, function() {
			if (req.user && req.user.roles && req.user.roles.indexOf(roleRequired) !== -1)
				next();
			else
				res.sendStatus(403);
		});
	};
};