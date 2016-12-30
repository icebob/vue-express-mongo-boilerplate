"use strict";

let path = require("path");
let glob = require("glob");
let webpack = require("webpack");

let precss = require("precss");
let autoprefixer = require("autoprefixer");

let ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
		app: ["./client/app/main.js"],
		frontend: ["./client/frontend/main.js"]
			//vendor: glob.sync("./src/vendor/**/*.js")
	},
	output: {
		path: path.resolve(__dirname, "server", "public", "app"),
		publicPath: "/app/",
		filename: "[name].js",
		chunkFilename: "[chunkhash].js"
	},
	module: {
		rules: [{
				test: /\.css$/,
				loaders: ["style-loader", "css-loader"]
			}, {
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract({
					fallbackLoader: "style-loader",
					loader: [{
						loader: "css-loader",
						options: {
							modules: true
						}
					}, {
						loader: "postcss-loader",
						options: {
							plugins: [
								require("autoprefixer")({
									browsers: ["last 2 versions"]
								}),
								precss
							]
						}
					}, {
						loader: "sass-loader"
					}]
				})
			}, {
				test: /\.js$/,
				loader: "babel-loader",
				exclude: [/node_modules/, /vendor/]
			}, {
				test: /\.vue$/,
				loader: "vue-loader",
				options: {
					postcss: [
						require("autoprefixer")({
							browsers: ["last 2 versions"]
						}),
						precss
					]
				}
			}, {
				test: /\.gif$/,
				loader: "url-loader",
				options: {
					name: "images/[name]-[hash:6].[ext]",
					limit: 100000
				}
			}, {
				test: /\.png$/,
				loader: "url-loader",
				options: {
					name: "images/[name]-[hash:6].[ext]",
					limit: 100000
				}
			}, {
				test: /\.jpg$/,
				loader: "file-loader",
				options: {
					name: "images/[name]-[hash:6].[ext]"
				}
			},
			// required for font-awesome icons
			{
				test: /\.(woff2?|svg)$/,
				loader: "url-loader",
				options: {
					limit: 10000,
					prefix: "font/"
				}
			}, {
				test: /\.(ttf|eot)$/,
				loader: "file-loader",
				options: {
					prefix: "font/"
				}
			}
		]
	},
	resolve: {
		extensions: [".vue", ".js", ".json"],
		alias: {
			"images": path.resolve(__dirname, "client", "images"),
			"vue$": "vue/dist/vue.common.js"
		}
	},
	plugins: [
			new webpack.DefinePlugin({
				"process.env": {
					// This has effect on the react lib size
					"NODE_ENV": JSON.stringify("production")
				}
			}),
			//new StatsPlugin('stats.json'),
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false
				}
			}),
			new webpack.LoaderOptionsPlugin({
				minimize: true
			}),

			new ExtractTextPlugin("styles/[name].css")
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
