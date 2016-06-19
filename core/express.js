"use strict";

let logger 			= require('./logger');
let config 			= require("../config");
let secrets 		= require("./secrets");

let express 		= require("express");
let http 			= require("http");
let path 			= require('path');

let flash 			= require("express-flash");
let favicon 		= require('serve-favicon');
let morgan 			= require('morgan');
let bodyParser 		= require('body-parser');
let cookieParser	= require('cookie-parser');
let csrf 			= require('csurf');

let passport 		= require("passport");
let session 		= require("express-session");
let compress 		= require("compression");
let methodOverride 	= require("method-override");
let helmet 			= require("helmet");
let crossdomain 	= require('helmet-crossdomain');
let mongoose 		= require("mongoose");
let MongoStore 		= require("connect-mongo")(session);

let stream = require('stream');
let lmStream = new stream.Stream();

lmStream.writable = true;
lmStream.write = function(data) {
	return logger.debug(data);
};

module.exports = function(db) {

	// Create express app
	let app = express();

	// Setting application local variables
	app.locals.app = config.app;

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		return next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
		},
		level: 3
	}));

	// Configure express app
	app.set('port', config.port);

	// Set view folder
	app.set("views", path.join(config.rootPath, "views"));
	app.set("view engine", "jade");

	// Environment dependent middleware
	if (config.isDevMode()) {
		app.set('showStackError', true);

		// Development logging
		app.use(morgan("dev", {
			stream: lmStream
		}));

		// Disable views cache
		app.set('view cache', false);
		app.use(helmet.noCache());

	} else {
		app.locals.cache = 'memory';
		app.set('view cache', true);
	}

	app.use(bodyParser.urlencoded({
		extended: true,
		limit: config.contentMaxLength * 2
	}));
	app.use(bodyParser.json());	
	app.use(methodOverride());

	// Use helmet to secure Express headers
	app.use(helmet.xssFilter());
	app.use(helmet.noSniff());
	app.use(helmet.ieNoOpen());
	app.use(crossdomain());
	app.use(helmet.hidePoweredBy());

	app.set('etag', true); // other values 'weak', 'strong'

	// Setting up static folder
	app.use(express["static"](path.join(config.rootPath, "public")));
	//app.use(favicon(path.join(config.rootPath, "public", "img", "favicon.ico")));

	// Cookie parser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: secrets.sessionSecret,
		store: new MongoStore({
			mongooseConnection: db.connection,
			collection: config.sessionCollection,
			autoReconnect: true
		}),
		cookie: config.sessionCookie,
		name: config.sessionName
	}));

	app.use(flash());

	// Use passport session
	app.use(passport.initialize());
	app.use(passport.session());	
	

	if (!config.isTestMode()) {
		// Handle CSRF
		app.use(csrf());

		// Keep user, csrf token and config available
		app.use(function(req, res, next) {
			res.locals._csrf = req.csrfToken();
			return next();
		});
	}

	// Load routes
	require("../routes")(app);

	return app;
};
