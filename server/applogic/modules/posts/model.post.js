"use strict";

let config    		= require("../../../config");
let logger    		= require("../../../core/logger");

let db	    		= require("../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../libs/hashids");
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
		required: "Please fill in an author ObjectId",
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
	metadata: {}

}, schemaOptions);

PostSchema.virtual("code").get(function() {
	return hashids.encodeHex(this._id);
});

PostSchema.virtual("upVotes").get(function() {
	return this.upVoters.length;
});

PostSchema.virtual("downVotes").get(function() {
	return this.downVoters.length;
});

PostSchema.virtual("votes").get(function() {
	return this.upVoters.length - this.downVoters.length;
});

PostSchema.plugin(autoIncrement.plugin, {
	model: "Post",
	startAt: 1
});

let Post = mongoose.model("Post", PostSchema);

module.exports = Post;
