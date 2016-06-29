"use strict";

let logger 	= require("../../logger");
let config 	= require("../../../config");
let secrets = require("../../secrets");
let helper 	= require("../helper");

let passport 		= require("passport");
let GoogleStrategy  = require("passport-twitter").Strategy;
let User 			= require("../../../models/user");

// https://apps.twitter.com/app/new
module.exports = function() {
	if (secrets.apiKeys && secrets.apiKeys.twitter && secrets.apiKeys.twitter.clientID) {

		passport.use("twitter", new GoogleStrategy({
			consumerKey: secrets.apiKeys.twitter.clientID,
			consumerSecret: secrets.apiKeys.twitter.clientSecret,
			callbackURL: "/auth/twitter/callback",
			passReqToCallback: true
		}, function(req, accessToken, refreshToken, profile, done) {
			//logger.info("Received profile: ", profile);

			helper.linkToSocialAccount({
				req, 
				accessToken,
				refreshToken,
				profile,
				done,

				provider: "twitter",
				email: `${profile.username}@twitter.com`,
				userData: {
					name: profile.displayName,
					gender: null,
					picture: profile._json.profile_image_url_https,
					location: profile._json.location
				}
			});

		}));

	}
};
