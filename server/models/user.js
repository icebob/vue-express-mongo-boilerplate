"use strict";

let config    		= require("../config");
let logger    		= require("../core/logger");
let C 				= require("../core/constants");
let fs 				= require("fs");
let path 			= require("path");

let _ 				= require("lodash");
let crypto 			= require("crypto");
let bcrypt 			= require("bcrypt-nodejs");

let db	    		= require("../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../libs/hashids")("users");
let autoIncrement 	= require("mongoose-auto-increment");

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
	passwordLess: {
		type: Boolean,
		default: false
	},
	passwordLessToken: {
		type: String
	},
	provider: {
		type: String,
		"default": "local"
	},
	profile: {},
	socialLinks: {
		facebook: { type: String, unique: true, sparse: true },
		twitter: { type: String, unique: true, sparse: true },
		google: { type: String, unique: true, sparse: true },
		github: { type: String, unique: true, sparse: true }
	},
	roles: {
		type: [
			{
				type: String,
				"enum": [
					C.ROLE_ADMIN,
					C.ROLE_USER,
					C.ROLE_GUEST
				]
			}
		],
		"default": [C.ROLE_USER]
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

	apiKey: {
		type: String,
		unique: true,
		index: true,
		sparse: true
	},

	lastLogin: {
		type: Date
	},
	
	metadata: {}

}, schemaOptions);

UserSchema.virtual("code").get(function() {
	return this.encodeID();
});

UserSchema.plugin(autoIncrement.plugin, {
	model: "User",
	startAt: 1
});

UserSchema.pre("save", function(next) {
	let user = this;
	if (!user.isModified("password")) 
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

UserSchema.virtual("gravatar").get(function() {
	if (!this.email) {
		return "https://gravatar.com/avatar/?s=64&d=wavatar";
	}
	let md5 = crypto.createHash("md5").update(this.email).digest("hex");
	return "https://gravatar.com/avatar/" + md5 + "?s=64&d=wavatar";
});

UserSchema.methods.encodeID = function() {
	return hashids.encodeHex(this._id);
}

UserSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
}

UserSchema.methods.pick = function(props, model) {
	return _.pick(model || this.toJSON(), props || [
		"code",
		"fullName",
		"email",
		"username",
		"roles",
		"lastLogin",
		"gravatar"
	]);	
}

/*
UserSchema.methods.gravatar = function (size, defaults) {
	if (!size)
		size = 200;

	if (!defaults)
		defaults = 'wavatar';

	if (!this.email)
		return `https://gravatar.com/avatar/?s=${size}&d=${defaults}`;

	let md5 = crypto.createHash('md5').update(this.email).digest("hex");
	return `https://gravatar.com/avatar/${md5}?s=${size}&d=${defaults}`;
};*/

let User = mongoose.model("User", UserSchema);

module.exports = User;
