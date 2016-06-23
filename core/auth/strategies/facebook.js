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
/*
			if (req.user) {
				logger.debug("Van beloginolva user. Megkeressük, hozzá van-e kötve valamelyik accounthoz");
				// There is logged in user. We only assign with this social account
				User.findOne( { "socialLinks.facebook": profile.id }, function(err, existingUser) {
					if (existingUser) {
						logger.debug("Találtunk usert:", existingUser.toJSON());
						if (existingUser._id != req.user._id) {
							// It's linked to an other account!
							req.flash("error", { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.'});
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
							user.socialLinks.facebook = profile.id;

							user.profile = user.profile || {};
							user.profile.name = user.profile.name || profile.name.givenName + ' ' + profile.name.familyName;
							user.profile.gender = user.profile.gender || profile._json.gender;
							user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;

							user.save(function(err) {
								req.flash("info", { msg: 'Google account has been linked.'});
								done(err, user);
							});
						});
					}
				});
				 
				
			} else {
				// No logged in user
				logger.debug("Nincs bejelentkezve user. Megkeressük kihez van linkelve");
				User.findOne( { "socialLinks.facebook": profile.id }, function(err, existingUser) {
					if (existingUser) {
						logger.debug("Megvan, sikeres login.", existingUser.toJSON());
						return done(err, existingUser);
					}

					logger.debug("Nincs, keresünk email alapján:", profile._json.email);
					User.findOne({ email: profile._json.email}, function(err, existingEmailUser) {
						if (existingEmailUser) {
							logger.debug("Van e-mailhez rendelve. Hozzárendeljük ahhoz");
							let user = existingEmailUser;
							user.socialLinks = user.socialLinks || {};
							user.socialLinks.facebook = profile.id;

							user.profile = user.profile || {};
							user.profile.name = user.profile.name || profile.name.givenName + ' ' + profile.name.familyName;
							user.profile.gender = user.profile.gender || profile._json.gender;
							user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;

							user.save(function(err) {
								req.flash("info", { msg: 'Google account has been linked.'});
								done(err, user);
							});

							return;
						}

						logger.debug("Nincs senkihez. Létrehozzuk az usert");

						let user = new User();
						user.fullName = profile.name.givenName + ' ' + profile.name.familyName;
						user.email = profile._json.email;
						user.username = user.email;
						user.provider = "facebook";
						user.verified = true;
						user.passwordLess = true;

						user.socialLinks = {
							facebook: profile.id
						};

						user.profile = {
							name: profile.name.givenName + ' ' + profile.name.familyName,
							gender: profile._json.gender,
							picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
							location: (profile._json.location) ? profile._json.location.name : ''
						};

						user.save(function(err) {
							done(err, user);
						});

					});
				});
			}

			*/

		}));

	}
};
