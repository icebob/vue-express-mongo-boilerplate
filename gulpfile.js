'use strict';

// Load gulp
var gulp = require('gulp'),
	fs = require("fs"),
	path = require("path"),
	exec = require('child_process').exec,
	$ = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'secret-utils']
	}),
	lr = require('tiny-lr')();

var webpack = require('webpack');
var webpackConfig = require("./webpack.config.js");	

var dirs = {
	serverFiles: {
		watching: [
			"config/**/*.js",
			"core/**/*.js",
			"libs/**/*.js",
			"models/**/*.js",
			"routes/**/*.js",
			"server.js",
			"webpack.config.js"
		]
	},
	clientFiles: {
		watching: [
			"web/app/**/*.*"
		]
	}
}

gulp.task('default', function() {
	gulp.start('dev');
});    

gulp.task('sass', function () {
	// return gulp.src('web/scss/**/*.scss')
	// 	.pipe($.sass().on('error', $.sass.logError))
	// 	.pipe($.autoprefixer({
	// 		browsers: ['last 2 versions']
	// 	}))
	// 	.pipe(gulp.dest('public/css'));
});

// Webpack futtatása (fejlesztés közben)
gulp.task("webpack:dev", function(callback) {
	// // modify some webpack config options
	// var wpDevConfig = Object.create(webpackConfig);
	// wpDevConfig.devtool = "inline-sourcemap";
	// wpDevConfig.debug = true;

	// // create a single instance of the compiler to allow caching
	// webpack(wpDevConfig, function(err, stats) {
	// 	if (err) throw new $.util.PluginError("webpack", err);
	// 	$.util.log("[webpack:build-dev]", stats.toString({
	// 		colors: true
	// 	}));
	// 	callback();
	// });
});

gulp.task("webpack:build", function(callback) {
	// modify some webpack config options
	var wpConfig = Object.create(webpackConfig);
	wpConfig.plugins = wpConfig.plugins.concat(
		new webpack.DefinePlugin({
			"process.env": {
				// This has effect on the react lib size
				"NODE_ENV": JSON.stringify("production")
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	);

	// run webpack
	webpack(wpConfig, function(err, stats) {
		if (err) throw new $.util.PluginError("webpack", err);
		$.util.log("[webpack:build-dev]", stats.toString({
			colors: true
		}));
		callback();
	});
});

function notifyLiveReload(files) {
	console.log("Send notify from files: ", files);
	lr.changed({
		body: {
			files: files
		}
	});
} 

gulp.task("dev", /*["sass", "webpack:dev"],*/ function() {

	gulp.watch(dirs.serverFiles.watching).on('change', function(file) {
		nodemon.emit("restart");
	});

	// gulp.watch(dirs.clientFiles.watching).on('change', function(file) {
	// 	gulp.start("webpack:dev", function() {
	// 		notifyLiveReload(["/"]);
	// 	});
	// });

	// gulp.watch("views/**/*.jade").on('change', function(file) {
	// 	notifyLiveReload(["/"]);
	// });

	// gulp.watch("web/scss/**/*.scss", function(file) {
	// 	gulp.start("sass", function() {
	// 		notifyLiveReload(["style.css"]);
	// 	});
	// });

	// Szerver indítása, újraindítása változás esetén
	var nodemon = $.nodemon({ script: 'server.js', ext: 'nofile', env: { 'NODE_ENV': 'development' } });

    nodemon.on('restart', function() {
	    setTimeout(function() {
	    	console.log("Server restarted. Reload browsers...");
			notifyLiveReload(["/"]);
		}, 5 * 1000);
    });
    
	// Live-reload indítása
	lr.listen(35729);
});

gulp.task("build", ["webpack:build"]);

/**
 * Bump version
 */
function bump(type) {
  var bumpType = type || 'patch'; // major.minor.patch

  return gulp.src('./package.json')
    .pipe($.bump({ type: bumpType }))
    .pipe(gulp.dest('./'));
}

gulp.task('bump-patch', [], function () { return bump('patch') });
gulp.task('bump-minor', [], function () { return bump('minor') });
gulp.task('bump-major', [], function () { return bump('major') });

gulp.task("publish", ["build"], function(cb) {
	exec("git push vps master", function( error, stdout, stderr) 
	{
		console.log(stdout);
		if ( error != null ) {
			console.error(stderr);
			return cb(error);
		}
		cb();
	});
});