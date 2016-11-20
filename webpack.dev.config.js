"use strict";

let path = require("path");
let glob = require("glob");
let webpack = require("webpack");

let precss = require("precss");
let autoprefixer = require("autoprefixer");

module.exports = {
	devtool: "eval-source-map",
	entry: {
		app: ["webpack-hot-middleware/client", "./client/app/main.js"],
		frontend: ["webpack-hot-middleware/client", "./client/frontend/main.js"]
	},
	output: {
		path: path.resolve(__dirname, "server", "public", "app"),
		publicPath: "/app/",
		filename: "[name].js",
		chunkFilename: "[chunkhash].js"
	},
	module: {
		loaders: [
			// required to write "require('./style.css')"
			{ test: /\.css$/,   loader: "style!css" },

			{ test: /\.scss$/, 	loaders: ["style", "css", "postcss", "sass"] },

			{ test: /\.json$/,   loader: "json-loader" },

			// ES6/7 syntax and JSX transpiling out of the box
    		{ test: /\.js$/,	loader: "babel", 		exclude: [/node_modules/, /vendor/], query: {
			presets: ["es2015", "stage-0"]
		}	
			},

			{ test: /\.vue$/,   loader: "vue" },

			{ test: /\.gif$/, 	loader: "url-loader?name=images/[name]-[hash:6].[ext]&limit=100000" },
			{ test: /\.png$/, 	loader: "url-loader?name=images/[name]-[hash:6].[ext]&limit=100000" },
			{ test: /\.jpg$/, 	loader: "file-loader?name=images/[name]-[hash:6].[ext]" },		

			// required for bootstrap icons
			{ test: /\.woff$/,  loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
			{ test: /\.ttf$/,   loader: "file-loader?prefix=font/" },
			{ test: /\.eot$/,   loader: "file-loader?prefix=font/" },
			{ test: /\.svg$/,   loader: "file-loader?prefix=font/" }

		]
	},
	resolve: {
    	extensions: ["", ".vue", ".js", ".json"],
    	alias: {
    		"images": path.resolve(__dirname, "client", "images")
    	}
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()

		//new ExtractTextPlugin("[name].css")
	],

	postcss: function () {
		return [
			autoprefixer({ browsers: ["last 2 versions"] }), 
			precss
		];
	},	

	vue: {
		autoprefixer: {
			browsers: ["last 2 versions"]
		}
	}	
};