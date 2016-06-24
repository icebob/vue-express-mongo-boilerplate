var path = require("path");
var glob = require("glob");
var webpack = require("webpack");
// var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
		app: ["./web/app/main.js"],
		frontend: ["./web/frontend/main.js"]
		//vendor: glob.sync("./src/vendor/**/*.js")
	},
	output: {
		path: path.resolve(__dirname, "public", "app"),
		publicPath: "/app/",
		filename: "[name].js",
		chunkFilename: "[chunkhash].js"
	},
	module: {
		loaders: [
			// required to write "require('./style.css')"
			{ test: /\.css$/,    loader: "style!css" },

			{ test: /\.scss$/, loaders: ["style", "css", "sass"] },

			{ test: /\.json$/,    loader: "json-loader" },

			// ES6/7 syntax and JSX transpiling out of the box
    		{ test: /\.js$/,	 loader: 'babel', 		exclude: [/node_modules/, /vendor/], query: {
					presets: ['es2015', 'stage-0']
				}	
			},

			{ test: /\.vue$/,    loader: "vue" },

			{ test: /\.gif$/, 	loader: "url-loader?name=images/[name]-[hash:6].[ext]&limit=100000" },
			{ test: /\.png$/, 	loader: "url-loader?name=images/[name]-[hash:6].[ext]&limit=100000" },
			{ test: /\.jpg$/, 	loader: "file-loader?name=images/[name]-[hash:6].[ext]" },			

			// required for bootstrap icons
			{ test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
			{ test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.eot$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.svg$/,    loader: "file-loader?prefix=font/" }

		]
	},
	resolve: {
    	extensions: ['', '.vue', '.js', '.json'],
    	alias: {
    		'images': path.resolve(__dirname, 'web', 'images')
    	}
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				// This has effect on the react lib size
				"NODE_ENV": JSON.stringify("production")
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
	],

	vue: {
		autoprefixer: {
			browsers: ['last 2 versions']
		}
	}	
};