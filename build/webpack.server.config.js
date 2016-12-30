"use strict";

let webpack = require("webpack");
let path = require("path");
let fs = require("fs");
let _ = require("lodash");

let nodeModules = {};
fs.readdirSync("node_modules")
	.filter(function(x) {
		return [".bin"].indexOf(x) === -1;
	})
	.forEach(function(mod) {
		nodeModules[mod] = "commonjs " + mod;
	});

module.exports = {
	target: "node",
	node: {
		console: false,
		global: false,
		process: false,
		Buffer: false,
		__filename: true,
		__dirname: true
	},

	entry: "./server/index.js",

	output: {
		path: path.join(__dirname, "..", "server"),
		filename: "bundle.js"
	},

	externals: _.defaults(nodeModules, {
		"../../config.js": "commonjs ../config.js"
	}),

	// devtool: "sourcemap",

	module: {
		rules: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: [/node_modules/, /vendor/]
			}
		]
	},

	plugins: [
		new webpack.DefinePlugin({
			WEBPACK_BUNDLE: true			
		}),
		
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			mangle: true
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})		
	]
};