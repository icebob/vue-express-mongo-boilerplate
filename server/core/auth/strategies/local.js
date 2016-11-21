"use strict";

let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let User = require("../../../models/user");

module.exports = function() {
	passport.use(new LocalStrategy({
		usernameField: "username",
		passwordField: "password",
		passReqToCallback : true
	}, function(req, username, password, done) {
		return User.findOne({
			$or: [ 
				{ "username": username}, 
				{ "email": username}
			]
		}, function(err, user) {
			if (err)
				return done(err);
			
			if (!user)
				return done(null, false, {
					message: req.t("UnknowUsernameOrEmail")
				});

			if (!user.verified)
				return done(null, false, {
					message: req.t("PleaseActivateAccount")
				});

			// Check that the user is not disabled or deleted
			if (user.status !== 1)
				return done(null, false, {
					message: req.t("UserDisabledOrDeleted")
				});

			if (user.passwordLess)
				return done(null, false, {
					message: req.t("PasswordlessAccountLeaveEmpty")
				});

			user.comparePassword(password, function(err, isMatch) {
				if (err)
					return done(err);

				if (isMatch !== true)
					return done(null, false, {
						message: req.t("InvalidPassword")
					});

				else
					return done(null, user);		

			});
		});
	}));
};
