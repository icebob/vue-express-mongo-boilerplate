"use strict";

let path = require("path");
let webpack = require("webpack");

let merge = require("webpack-merge");
let baseWpConfig = require("./webpack.base.config");
//let StatsPlugin = require("stats-webpack-plugin");
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let ExtractTextPlugin = require("extract-text-webpack-plugin");

let extractLoaders = [{
	loader: "css-loader"
}, {
	loader: "postcss-loader"
}, {
	loader: "sass-loader"
}];

module.exports = merge(baseWpConfig, {
	module: {
		rules: [{
			test: /\.scss$/,
			loader: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: extractLoaders
			})
		}, {
			test: /\.vue$/,
			loader: "vue-loader",
			options: {
				loaders: {
					sass: ExtractTextPlugin.extract({
						fallback: "vue-style-loader",
						use: extractLoaders
					})
				}
			}
		}]
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("production")
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),

		new ExtractTextPlugin("styles/[name].css"),

		/*new StatsPlugin(path.resolve(__dirname, "stats.json"), {
			chunkModules: true
			//exclude: [/node_modules[\\\/]react/]
		})*/

		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: path.join(__dirname, 'report.html'),
			openAnalyzer: false
		})
	]
});
