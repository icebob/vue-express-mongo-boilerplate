"use strict";

let config    		= require("../config");
let logger    		= require('../core/logger');
let fs 				= require("fs");
let path 			= require("path");

let db	    		= require('../core/mongo');
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../libs/hashids");
let autoIncrement 	= require('mongoose-auto-increment');

var schemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
};

let UserSchema = new Schema({
	name: String,
	email: { type: String, unique: true},
	password: String,
	passwordResetToken: String,
	passwordResetExpires: Date,
	gender: String,
	location: String,
	website: String,
	picture: String,
	facebook: String,
	twitter: String,
	google: String,
	vk: String,	
	metaData: {}
}, schemaOptions);

UserSchema.virtual("code").get(function() {
	return hashids.encodeHex(this._id);
});

UserSchema.plugin(autoIncrement.plugin, {
	model: "User",
	startAt: 1
});

UserSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) { return next(); }
	
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.password, salt, null, function(err, hash) {
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function(password, cb) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		cb(err, isMatch);
	});
};

UserSchema.virtual('gravatar').get(function() {
	if (!this.get('email')) {
		return 'https://gravatar.com/avatar/?s=200&d=retro';
	}
	var md5 = crypto.createHash('md5').update(this.get('email')).digest('hex');
	return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
});

let User = mongoose.model("User", UserSchema);

module.exports = User;
