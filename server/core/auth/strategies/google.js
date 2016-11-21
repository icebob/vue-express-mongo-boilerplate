"use strict";

let logger 	= require("../../logger");
let config 	= require("../../../config");
let helper 	= require("../helper");

let passport 		= require("passport");
let GoogleStrategy  = require("passport-google-oauth").OAuth2Strategy;
let User 			= require("../../../models/user");

// https://console.developers.google.com/project/express-mongo-boilerplate/apiui/consent
module.exports = function() {
	if (config.authKeys.google.clientID && config.authKeys.google.clientSecret) {

		passport.use("google", new GoogleStrategy({
			clientID: config.authKeys.google.clientID,
			clientSecret: config.authKeys.google.clientSecret,
			callbackURL: "/auth/google/callback",
			passReqToCallback: true
		}, function(req, accessToken, refreshToken, profile, done) {
			// logger.info("Received profile: ", profile);

			helper.linkToSocialAccount({
				req, 
				accessToken,
				refreshToken,
				profile,
				done,

				provider: "google",
				email: profile.emails[0].value,
				userData: {
					name: profile.displayName,
					gender: profile.gender,
					picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value.replace("sz=50", "sz=200") : null,
					location: null
				}
			});

		}));

	}
};
