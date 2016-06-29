"use strict";

let logger 	= require("../../logger");
let config 	= require("../../../config");
let secrets = require("../../secrets");
let helper 	= require("../helper");

let passport 		= require("passport");
let GoogleStrategy  = require("passport-github").Strategy;
let User 			= require("../../../models/user");

// https://github.com/settings/applications/new
module.exports = function() {
	if (secrets.apiKeys && secrets.apiKeys.github && secrets.apiKeys.github.clientID) {

		passport.use("github", new GoogleStrategy({
			clientID: secrets.apiKeys.github.clientID,
			clientSecret: secrets.apiKeys.github.clientSecret,
			callbackURL: "/auth/github/callback",
			passReqToCallback: true
		}, function(req, accessToken, refreshToken, profile, done) {
			//logger.info("Received profile: ", profile);

			helper.linkToSocialAccount({
				req, 
				accessToken,
				refreshToken,
				profile,
				done,

				provider: "github",
				email: profile._json.email,
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
