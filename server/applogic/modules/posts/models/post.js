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

let PostSchema = new Schema({
	title: {
		type: String,
		trim: true
	},
	content: {
		type: String,
		trim: true
	},
	author: {
		type: Number,
		required: "Please fill in an author ID",
		ref: "User"
	},
	views: {
		type: Number,
		default: 0
	},
	upVoters: {
		type: [Number]
	},
	downVoters: {
		type: [Number]
	},
	votes: {
		type: Number,
		default: 0
	},
	metadata: {}

}, schemaOptions);

PostSchema.virtual("code").get(function() {
	return hashids.encodeHex(this._id);
});

PostSchema.plugin(autoIncrement.plugin, {
	model: "Post",
	startAt: 1
});

let Post = mongoose.model("Post", PostSchema);

module.exports = Post;
