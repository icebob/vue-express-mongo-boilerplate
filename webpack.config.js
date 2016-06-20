var path = require("path");
var glob = require("glob");
var webpack = require("webpack");

module.exports = {
	cache: true,
	entry: {
		app: ['webpack-hot-middleware/client', "./web/app/main.js"]
		//vendor: glob.sync("./src/vendor/**/*.js")
	},
	output: {
		path: path.resolve(__dirname, "public", "scripts"),
		publicPath: "/scripts/",
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

			// required for bootstrap icons
			{ test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
			{ test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.eot$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.svg$/,    loader: "file-loader?prefix=font/" }

		]
	},
	resolve: {
    	extensions: ['', '.js', '.json']
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	],

	vue: {
		autoprefixer: {
			browsers: ['last 2 versions']
		}
	}	
};