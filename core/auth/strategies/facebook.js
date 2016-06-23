"use strict";

let logger 	= require('../../logger');
let config 	= require("../../../config");
let secrets = require('../../secrets');
let helper 	= require('../helper');

let passport 			= require('passport');
let FacebookStrategy  	= require('passport-facebook').Strategy;
let User 				= require('../../../models/user');

// https://developers.facebook.com/apps/263499360672568/dashboard/
module.exports = function() {
	if (secrets.apiKeys && secrets.apiKeys.facebook && secrets.apiKeys.facebook.clientID) {

		passport.use('facebook', new FacebookStrategy({
			clientID: secrets.apiKeys.facebook.clientID,
			clientSecret: secrets.apiKeys.facebook.clientSecret,
			callbackURL: '/auth/facebook/callback',
			profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
			passReqToCallback: true
		}, function(req, accessToken, refreshToken, profile, done) {
			//logger.info("Received profile: ", profile);
			
			helper.linkToSocialAccount({
				req, 
				accessToken,
				refreshToken,
				profile,
				done,

				provider: "facebook",
				email: profile._json.email,
				userData: {
					name: profile.name.givenName + ' ' + profile.name.familyName,
					gender: profile._json.gender,
					picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
					location: (profile._json.location) ? profile._json.location.name : null
				}
			});

		}));

	}
};
