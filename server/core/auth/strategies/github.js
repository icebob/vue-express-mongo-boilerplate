"use strict";

let logger 	= require("../../logger");
let config 	= require("../../../config");
let helper 	= require("../helper");

let passport 		= require("passport");
let GithubStrategy  = require("passport-github").Strategy;
let User 			= require("../../../models/user");

// https://github.com/settings/applications/new
module.exports = function() {
	if (config.authKeys.github.clientID && config.authKeys.github.clientSecret) {

		passport.use("github", new GithubStrategy({
			clientID: config.authKeys.github.clientID,
			clientSecret: config.authKeys.github.clientSecret,
			callbackURL: "/auth/github/callback",
			scope: [ "user:email" ],
			passReqToCallback: true
		}, function(req, accessToken, refreshToken, profile, done) {
			logger.info("Received profile: ", profile);

			let email;
			if (profile.emails && profile.emails.length > 0) {
				email = profile.emails.find((email) => { return email.primary; });
				if (!email) email = profile.emails[0];
			}

			helper.linkToSocialAccount({
				req, 
				accessToken,
				refreshToken,
				profile,
				done,

				provider: "github",
				username: profile.username,
				email: email ? email.value : null,
				userData: {
					name: profile.displayName,
					gender: null,
					picture: profile._json.avatar_url,
					location: profile._json.location
				}
			});

		}));

	}
};
