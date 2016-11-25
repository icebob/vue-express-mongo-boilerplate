"use strict";

let logger 		= require("../logger");
let config 		= require("../../config");
let passport 	= require("passport");

let User 		= require("../../models/user");

// TODO response 

/**
 * Check the request is come from an authenticated user
 */
module.exports.isAuthenticated = function isAuthenticated(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else {
		return res.sendStatus(401);
	}
};

/**
 * Try authenticate the requester user with API key.
 * We search `apikey` field in `headers`, `query` and `body` 
 */
module.exports.tryAuthenticateWithApiKey = function tryAuthenticatedWithApiKey(req, res, next) {
	if (!req.isAuthenticated()) {
		// Try authenticate with API KEY
		if (req.headers.apikey || req.query.apikey || req.body.apikey) {
			passport.authenticate("localapikey", (err, user, info) => {
				if (user) {
					req.login(user, function(err) {
						next();
					});
				} else {
					logger.warn("Apikey error:", info);
					next();
				}

			})(req, res, next);
		}
		else
			next();
	}
	else
		next();
};

/**
 * If not authenticated, we authenticate with API key.
 * We search `apikey` field in `headers`, `query` and `body` 
 */
module.exports.isAuthenticatedOrApiKey = function isAuthenticated(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else {
		// Try authenticate with API KEY
		if (req.headers.apikey || req.query.apikey || req.body.apikey) {
			passport.authenticate("localapikey", (err, user, info) => {
				if (err) 
					return res.sendStatus(500);

				if (!user)
					return res.status(401).send(info.message || "");

				req.login(user, function(err) {
					if (err) 
						return res.sendStatus(500);

					return next();
				});

			})(req, res, next);
		}
		else
			return res.sendStatus(401);
	}
};

/**
 * Check the requester user has a role.
 */
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

/**
 * Check the requester user is an administrator. (they has `admin` role)
 */
module.exports.hasAdminRole = function hasAdminRole() {
	return module.exports.hasRole("admin");
};

/**
 * Link a social account to an user account
 */
module.exports.linkToSocialAccount = function linkToSocialAccount(opts) {

	let req = opts.req;
	let accessToken = opts.accessToken;
	let refreshToken = opts.refreshToken;
	let profile = opts.profile;
	let done = opts.done;
	let provider = opts.provider;
	let username =  opts.username;
	let email = opts.email;
	let userData = opts.userData;

	if (req.user) {
		// There is logged in user. We only assign with this social account
		let search = {};
		search[`socialLinks.${provider}`] = profile.id;
		User.findOne( search, function(err, existingUser) {
			if (existingUser) {
				if (existingUser._id != req.user._id) {
					// It's linked to an other account!
					req.flash("error", { msg: req.t("SocialIDLinkedToOtherAccount") });
					return done(err);
				}
				else
					// Same user same account
					return done(err, existingUser);

			} else {
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
						req.flash("info", { msg: req.t("AccountHasBeenLinked") });
						done(err, user);
					});
				});
			}
		});
		
	} else {
		
		// No logged in user
		let search = {};
		search[`socialLinks.${provider}`] = profile.id;
		User.findOne(search, function(err, existingUser) {

			if (existingUser) {

				// Check that the user is not disabled or deleted
				if (existingUser.status !== 1) {
					req.flash("error", { msg: req.t("UserDisabledOrDeleted")});
					return done();
				}
				
				return done(err, existingUser);
			}

			if (!email) {
				// Not provided email address
				req.flash("error", { msg: req.t("SocialMissingEmailAddress")});
				return done();				
			}

			// If come back email address from social provider, search user by email
			User.findOne({email: email}, function(err, existingEmailUser) {
				if (existingEmailUser) {

					// Check that the user is not disabled or deleted
					if (existingEmailUser.status !== 1) {
						req.flash("error", { msg: req.t("UserDisabledOrDeleted")});
						return done();
					}

					// We found the user, update the profile
					let user = existingEmailUser;
					user.socialLinks = user.socialLinks || {};
					user.socialLinks[provider] = profile.id;

					user.profile = user.profile || {};
					user.profile.name = user.profile.name || userData.name;
					user.profile.gender = user.profile.gender || userData.gender;
					user.profile.picture = user.profile.picture || userData.picture;
					user.profile.location = user.profile.location || userData.location;

					user.save(function(err) {
						req.flash("info", { msg: req.t("AccountHasBeenLinked") });
						done(err, user);
					});

					return;
				}

				// We don't find the user, it will be a signup

				// Check the signup enabled
				if (config.features.disableSignUp === true) {
					req.flash("error", { msg: req.t("SignUpDisabledPleaseLogin") });
					return done();
				}

				// Create a new user according to social profile
				let user = new User();
				user.fullName = userData.name;
				user.email = email;
				user.username = email; // username will be the e-mail address if signup with a social account. Because maybe conflict other exist user's username
				user.provider = provider;
				user.verified = true; // No need to verify a social signup
				user.passwordLess = true; // No password for this account. He/she can login via social login or passwordless login

				user.socialLinks = {};
				user.socialLinks[provider] = profile.id;

				user.profile = userData;

				user.save(function(err) {
					done(err, user);
				});

			});

		});
	}


};