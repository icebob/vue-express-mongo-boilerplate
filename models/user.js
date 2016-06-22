"use strict";

let config    		= require("../config");
let logger    		= require('../core/logger');
let fs 				= require("fs");
let path 			= require("path");

let crypto 			= require('crypto');
let bcrypt 			= require('bcrypt-nodejs');

let db	    		= require('../core/mongo');
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../libs/hashids");
let autoIncrement 	= require('mongoose-auto-increment');

let schemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
};

let validateLocalStrategyProperty = function(property) {
	return (this.provider !== "local" && !this.updated) || property.length;
};

let validateLocalStrategyPassword = function(password) {
	return this.provider !== "local" || (password && password.length >= 6);
};

let UserSchema = new Schema({
	fullName: {
		type: String,
		trim: true,
		"default": "",
		validate: [validateLocalStrategyProperty, "Please fill in your full name"]
	},
	email: {
		type: String,
		trim: true,
		unique: true,
		index: true,
		lowercase: true,
		"default": "",
		validate: [validateLocalStrategyProperty, "Please fill in your email"],
		match: [/.+\@.+\..+/, "Please fill a valid email address"]
	},
	username: {
		type: String,
		unique: true,
		index: true,
		required: "Please fill in a username",
		trim: true
	},
	password: {
		type: String,
		"default": "",
		validate: [validateLocalStrategyPassword, "Password should be longer"]
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		"default": "local"
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [
			{
				type: String,
				"enum": ["admin", "user", "guest"]
			}
		],
		"default": ["user"]
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	
	verified: { 
		type: Boolean, 
		default: false 
	},
	
	verifyToken: { 
		type: String 
	},

	/* Mongoose add createdAt and updatedAt fields automatically
	updated: {
		type: Date
	},
	created: {
		type: Date,
		"default": Date.now
	},*/
	lastLogin: {
		type: Date
	},
	metadata: {}

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
	if (!user.isModified('password')) 
		return next();
	
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
