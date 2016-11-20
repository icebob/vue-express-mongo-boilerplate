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
		path: path.join(__dirname, "server"),
		filename: "bundle.js"
	},

	externals: _.defaults(nodeModules, {
		//"../../package.json": "commonjs ../package.json"
	}),

	devtool: "sourcemap",

	module: {
		loaders: [
			{ test: /\.json$/, loader: "json-loader" },

			// ES6/7 syntax and JSX transpiling out of the box
    		{ test: /\.js$/,	 loader: "babel", 		exclude: [/node_modules/, /vendor/], query: {
			presets: ["es2015", "stage-0"]
		}	
			}

		]
	},

	plugins: [
		
		new webpack.DefinePlugin({
			WEBPACK_BUNDLE: true			
		}),
		//new StatsPlugin('stats.json'),
		new webpack.optimize.DedupePlugin(),
		
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			mangle: true
		})
	]
};