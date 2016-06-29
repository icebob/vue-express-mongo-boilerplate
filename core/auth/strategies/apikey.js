"use strict";

let passport = require("passport");
let LocalAPIKeyStrategy = require("passport-localapikey-update").Strategy;
let User = require("../../../models/user");

module.exports = function() {
	passport.use(new LocalAPIKeyStrategy({
		passReqToCallback : true
	}, function(req, apiKey, done) {
		return User.findOne({
			"apiKey": apiKey
		}, function(err, user) {
			if (err)
				return done(err);
			
			if (!user)
				return done(null, false, {
					message: "Unknow API key!"
				});

			if (!user.verified)
				return done(null, false, {
					message: "Please activate your account!"
				});

			return done(null, user);		
		});
	}));
};
