"use strict";

let ROOT 			= "../../../../";
let config    		= require(ROOT + "config");
let logger    		= require(ROOT + "core/logger");

let db	    		= require(ROOT + "core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require(ROOT + "libs/hashids");
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
	return hashids.encodeHex(this._id);
});

DeviceSchema.plugin(autoIncrement.plugin, {
	model: "Device",
	startAt: 1
});

let Device = mongoose.model("Device", DeviceSchema);

module.exports = Device;
