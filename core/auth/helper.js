"use strict";

let logger = require('../logger');
let config = require("../../config");
let passport = require("passport");

let User 	= require('../../models/user');

module.exports.isAuthenticated = function isAuthenticated(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else {
		return res.sendStatus(401);
	}
};

module.exports.isAuthenticatedOrApiKey = function isAuthenticated(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else {
		// Try authenticate with API KEY
		if (req.headers.apikey || req.query.apikey || req.body.apikey) {
			passport.authenticate('localapikey', (err, user, info) => {
				if (err) 
					return res.sendStatus(50);

				if (!user)
					return res.status(401).send(info.message || '');

				req.login(user, function(err) {
					if (err) 
						return res.sendStatus(50);

					return next();
				});

			})(req, res, next);
		}
		else
			return res.sendStatus(401);
	}
};

module.exports.hasRole = function hasRole(roleRequired) {
	if (!roleRequired)
		throw new Error("Required role needs to be set");

	return function(req, res, next) {
		return module.exports.isAuthenticated(req, res, function() {
			if (req.user && req.user.roles && req.user.roles.indexOf(roleRequired) !== -1)
				next();
			else
				res.sendStatus(403);
		});
	};
};

module.exports.hasAdminRole = function hasAdminRole() {
	return module.exports.hasRole("admin");
}

module.exports.linkToSocialAccount = function linkToSocialAccount(opts) {

	let req = opts.req;
	let accessToken = opts.accessToken;
	let refreshToken = opts.refreshToken;
	let profile = opts.profile;
	let done = opts.done;
	let provider = opts.provider;
	let email = opts.email;
	let userData = opts.userData;

	if (req.user) {
		logger.debug("Van beloginolva user. Megkeressük, hozzá van-e kötve valamelyik accounthoz");
		
		// There is logged in user. We only assign with this social account
		let search = {};
		search[`socialLinks.${provider}`] = profile.id;
		User.findOne( search, function(err, existingUser) {
			if (existingUser) {
				logger.debug("Találtunk usert:", existingUser.toJSON());
				if (existingUser._id != req.user._id) {
					// It's linked to an other account!
					req.flash("error", { msg: 'There is already an account that belongs to you. Sign in with that account or delete it, then link it with your current account.'});
					return done(err);
				}
				else
					// Same user same account
					return done(err, existingUser);

			} else {
				logger.debug("Nem találtunk usert. Hozzálinkeljük ahhoz aki be van jelentkezve.");
				// Not found linked account. We create the link
				User.findById(req.user.id, function(err, user) {
					user.socialLinks = user.socialLinks || {};
					user.socialLinks[provider] = profile.id;

					user.profile = user.profile || {};
					user.profile.name = user.profile.name || userData.name;
					user.profile.gender = user.profile.gender || userData.gender;
					user.profile.picture = user.profile.picture || userData.picture;
					user.profile.location = user.profile.location || userData.location;

					user.save(function(err) {
						req.flash("info", { msg: 'Account has been linked.'});
						done(err, user);
					});
				});
			}
		});
		 
		
	} else {
		
		// No logged in user
		logger.debug("Nincs bejelentkezve user. Megkeressük kihez van linkelve");
		let search = {};
		search[`socialLinks.${provider}`] = profile.id;
		User.findOne(search, function(err, existingUser) {

			if (existingUser) {
				logger.debug("Megvan, sikeres login.");
				return done(err, existingUser);
			}

			logger.debug("Nincs, keresünk email alapján:", email);
			if (email) {
			User.findOne({email: email}, function(err, existingEmailUser) {
				if (existingEmailUser) {
					logger.debug("Van e-mailhez rendelve. Hozzárendeljük ahhoz");
					let user = existingEmailUser;
					user.socialLinks = user.socialLinks || {};
					user.socialLinks[provider] = profile.id;

					user.profile = user.profile || {};
					user.profile.name = user.profile.name || userData.name;
					user.profile.gender = user.profile.gender || userData.gender;
					user.profile.picture = user.profile.picture || userData.picture;
					user.profile.location = user.profile.location || userData.location;

					user.save(function(err) {
						req.flash("info", { msg: 'Account has been linked.'});
						done(err, user);
					});

					return;
				}
				logger.debug("Nincs senkihez. Létrehozzuk a user-t");

				let user = new User();
				user.fullName = userData.name;
				user.email = email;
				user.username = email;
				user.provider = provider;
				user.verified = true;
				user.passwordLess = true;

				user.socialLinks = {};
				user.socialLinks[provider] = profile.id;

				user.profile = userData;

				user.save(function(err) {
					done(err, user);
				});

			});

			} else {
				// Not provided email address
				req.flash("error", { msg: 'Missing email address. Please signup manually!'});
				done();
			}
		});
	}


}