"use strict";

let path = require("path");
let glob = require("glob");
let webpack = require("webpack");

let StatsPlugin = require("stats-webpack-plugin");
let ExtractTextPlugin = require("extract-text-webpack-plugin");

let postcssConfig = {
	plugins: [
		require("autoprefixer")({
			browsers: ["last 3 versions"]
		}),
		require("precss")
	]
};

module.exports = {
	entry: {
		app: ["./client/app/main.js"],
		vendor: [
			"es6-promise",
			"vue",
			"vue-router",
			"vuex",
			"lodash",
			"moment",
			"jquery",
			"axios",
			"toastr",
			"vue-form-generator",
			"vue-websocket",
			"apollo-client",
			"graphql-tag",
			"i18next"
		],
		frontend: ["./client/frontend/main.js"]
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
						options: postcssConfig
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
					postcss: postcssConfig.plugins,
					loaders: {
						sass: ExtractTextPlugin.extract({
							fallbackLoader: "vue-style-loader",
							loader: [{
								loader: "css-loader",
								options: {
									modules: true
								}
							}, {
								loader: "postcss-loader",
								options: postcssConfig
							}, {
								loader: "sass-loader"
							}]
						})
					}
				}
			}, {
				test: /\.gif$/,
				loader: "url-loader",
				options: {
					name: "images/[name]-[hash:6].[ext]",
					limit: 10000
				}
			}, {
				test: /\.png$/,
				loader: "url-loader",
				options: {
					name: "images/[name]-[hash:6].[ext]",
					limit: 10000
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
		mainFiles: ["index"],
		alias: {
			"images": path.resolve(__dirname, "client", "images"),
			"vue$": "vue/dist/vue.common.js"
		}
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("production")
			}
		}),
		// extract vendor chunks for better caching
		new webpack.optimize.CommonsChunkPlugin({
			name: "vendor"
		}),		
		//new StatsPlugin('stats.json'),
		/*new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		}),*/

		new ExtractTextPlugin("styles/[name].css"),
		/*new StatsPlugin(path.resolve(__dirname, "stats.json"), {
			chunkModules: true
			//exclude: [/node_modules[\\\/]react/]
		})*/
	]
};
