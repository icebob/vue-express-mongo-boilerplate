"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("../../../../core/mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("devices");
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

let DeviceSchema = new Schema({
	address: {
		type: String,
		trim: true
	},
	type: {
		type: String,
		trim: true
	},
	name: {
		type: String,
		trim: true
	},
	description: {
		type: String,
		trim: true,
		"default": ""
	},
	status: {
		type: Number,
		"default": 1
	},
	lastCommunication: {
		type: Date,
		"default": Date.now
	},
	metadata: {}

}, schemaOptions);

DeviceSchema.virtual("code").get(function() {
	return this.encodeID();
});

DeviceSchema.plugin(autoIncrement.plugin, {
	model: "Device",
	startAt: 1
});

DeviceSchema.methods.encodeID = function() {
	return hashids.encodeHex(this._id);
};

DeviceSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

let Device = mongoose.model("Device", DeviceSchema);

module.exports = Device;
