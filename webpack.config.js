var path = require("path");
var glob = require("glob");
var webpack = require("webpack");

module.exports = {
	cache: true,
	entry: {
		app: "./web/app/main.js"
		//vendor: glob.sync("./src/vendor/**/*.js")
	},
	output: {
		path: path.join(__dirname, "public", "scripts"),
		publicPath: path.join("public", "scripts"),
		filename: "[name].js",
		chunkFilename: "[chunkhash].js"
	},
	module: {
		loaders: [
			// required to write "require('./style.css')"
			{ test: /\.css$/,    loader: "style-loader!css-loader" },

			{ test: /\.json$/,    loader: "json-loader" },

			// ES6/7 syntax and JSX transpiling out of the box
    		{ test: /\.js$/,	 loader: 'babel', 		exclude: [/node_modules/, /vendor/], query: {
					presets: ['es2015'],
				}	
			},

			// required for bootstrap icons
			{ test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
			{ test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.eot$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.svg$/,    loader: "file-loader?prefix=font/" }

		]
	},
	resolve: {
		// you can now require('file') instead of require('file.coffee')
    	extensions: ['', '.js', '.json']
	},
	plugins: []
};