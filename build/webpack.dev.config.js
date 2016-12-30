"use strict";

let path = require("path");
let webpack = require("webpack");

let moduleConfig = require("./modules.config");

let merge = require("webpack-merge");
let baseWpConfig = require("./webpack.base.config");

baseWpConfig.entry.app.unshift("webpack-hot-middleware/client");
baseWpConfig.entry.frontend.unshift("webpack-hot-middleware/client");

module.exports = merge(baseWpConfig, {
	devtool: "#inline-source-map",

	module: {
		rules: [
			{
				test: /\.scss$/,
				loaders: ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
			},
			{
				test: /\.vue$/,
				loader: "vue-loader",
				options: {
					postcss: moduleConfig.postcss.plugins
				}
			}			
		]
	},

	performance: {
		hints: false
	},

	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	]
});
