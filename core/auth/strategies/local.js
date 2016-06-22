"use strict";

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let User = require('../../../models/user');

module.exports = function() {
	passport.use(new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	}, function(username, password, done) {
		return User.findOne({
			username: username
		}, function(err, user) {
			if (err)
				return done(err);
			
			if (!user)
				return done(null, false, {
					message: 'Unknow username'
				});

			if (!user.verified)
				return done(null, false, {
					message: 'Please activate your account!'
				});

			console.log(user);
			if (user.passwordLess)
				return done(null, false, {
					message: 'This is a passwordless account! Please leave empty the password field.'
				});

			user.comparePassword(password, function(err, isMatch) {
				if (err)
					return done(err);

				if (isMatch !== true)
					return done(null, false, {
						message: 'Invalid password'
					});

				else
					return done(null, user);		

			});
		});
	}));
};
