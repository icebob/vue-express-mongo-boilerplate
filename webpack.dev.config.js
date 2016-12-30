"use strict";

let path = require("path");
let glob = require("glob");
let webpack = require("webpack");

let precss = require("precss");
let autoprefixer = require("autoprefixer");

module.exports = {
	devtool: "#inline-source-map",
	
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
		rules: [
			{ test: /\.css$/,   loaders: ["style-loader", "css-loader"] },

			{ test: /\.scss$/, 	loaders: ["style-loader", "css-loader", "postcss-loader", "sass-loader"] },

			// ES6/7 syntax and JSX transpiling out of the box
			{ test: /\.js$/,	loader: "babel-loader",	exclude: [/node_modules/, /vendor/] },

			{ test: /\.vue$/,   loader: "vue-loader" },

			{ test: /\.gif$/, 	loader: "url-loader", options: { name: "images/[name]-[hash:6].[ext]", limit: 100000 } },
			{ test: /\.png$/, 	loader: "url-loader", options: { name: "images/[name]-[hash:6].[ext]", limit: 100000 } },
			{ test: /\.jpg$/, 	loader: "file-loader", options: { name: "images/[name]-[hash:6].[ext]" } },		

			// required for font-awesome icons
			{ test: /\.(woff2?|svg)$/, loader: "url-loader", options: { limit: 10000, prefix: "font/" } },
			{ test: /\.(ttf|eot)$/, loader: "file-loader", options: { prefix: "font/" } }
		]
	},

	resolve: {
		extensions: [".vue", ".js", ".json"],
		alias: {
			"images": path.resolve(__dirname, "client", "images"),
			"vue$": "vue/dist/vue.common.js"
		}
	},

	performance: {
		hints: false
	},

	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	]
	/*
	vue: {
		postcss: [
			require("autoprefixer")({
				browsers: ["last 2 versions"]
			}),
			precss
		]
	}	
	*/
};