"use strict";

let path = require("path");
let webpack = require("webpack");

let merge = require("webpack-merge");
let baseWpConfig = require("./webpack.base.config");
//let StatsPlugin = require("stats-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(baseWpConfig, {
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader"/*,
						options: {
							modules: true,
							sourceMap: true,
							importLoader: 2
						}*/
					},
					"sass-loader"
				]
			}, {
				test: /\.vue$/,
				loader: "vue-loader",
				options: {
					loaders: {
						sass: [
							MiniCssExtractPlugin.loader,
							{
								loader: "css-loader"/*,
								options: {
									modules: true,
									sourceMap: true,
									importLoader: 2
								}*/
							},
							"sass-loader"
						]
					}
				}
			}, {
				test: /\.pug$/,
				loader: 'pug-plain-loader'
			}
		]
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: "vendor",
					name: "vendor",
					enforce: true
				}
			}
		},
		minimizer: [
			new UglifyJsPlugin({
				warningsFilter: (src) => true
			})
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("production")
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),

		new MiniCssExtractPlugin({
			filename: "styles/[name].css"
		})

		/*new StatsPlugin(path.resolve(__dirname, "stats.json"), {
			chunkModules: true
			//exclude: [/node_modules[\\\/]react/]
		})*/
	]
});
