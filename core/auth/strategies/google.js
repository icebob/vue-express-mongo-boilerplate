"use strict";

let logger 	= require("../../logger");
let config 	= require("../../../config");
let secrets = require("../../secrets");
let helper 	= require("../helper");

let passport 		= require("passport");
let GoogleStrategy  = require("passport-google-oauth").OAuth2Strategy;
let User 			= require("../../../models/user");

// https://console.developers.google.com/project/express-mongo-boilerplate/apiui/consent
module.exports = function() {
	if (secrets.apiKeys && secrets.apiKeys.google && secrets.apiKeys.google.clientID) {

		passport.use("google", new GoogleStrategy({
			clientID: secrets.apiKeys.google.clientID,
			clientSecret: secrets.apiKeys.google.clientSecret,
			callbackURL: "/auth/google/callback",
			passReqToCallback: true
		}, function(req, accessToken, refreshToken, profile, done) {
			//logger.info("Received profile: ", profile);

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
					gender: profile._json.gender,
					picture: profile._json.image.url,
					location: null
				}
			});

		}));

	}
};
