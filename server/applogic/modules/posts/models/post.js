"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let _ 				= require("lodash");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("../../../../core/mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("posts");
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
	voters: [{
		type: Number,
		ref: "User"
	}],
	votes: {
		type: Number,
		default: 0
	},
	editedAt: {
		type: Date
	},
	metadata: {}

}, schemaOptions);

PostSchema.virtual("code").get(function() {
	return this.encodeID();
});

PostSchema.plugin(autoIncrement.plugin, {
	model: "Post",
	startAt: 1
});

PostSchema.methods.encodeID = function() {
	return hashids.encodeHex(this._id);
};

PostSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

/*
PostSchema.static("getByID", function(id) {
	let query;
	if (_.isArray(id)) {
		query = this.collection.find({ _id: { $in: id} });
	} else
		query = this.collection.findById(id);

	return query
		.populate({
			path: "author",
			select: ""
		})
});*/

let Post = mongoose.model("Post", PostSchema);

module.exports = Post;
