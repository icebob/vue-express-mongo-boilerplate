"use strict";

const logger 			= require("../../core/logger");
const config 			= require("../../config");
const redis 			= require("../../core/redis");

const express 			= require("express");
const http 				= require("http");
const path 				= require("path");

const moment 			= require("moment");
const flash 			= require("express-flash");
const favicon 			= require("serve-favicon");
const morgan 			= require("morgan");
const bodyParser 		= require("body-parser");
const cookieParser		= require("cookie-parser");
const validator 		= require("express-validator");
const csrf 				= require("csurf");
const netjet			= require("netjet");

const session 			= require("express-session");
const compress 			= require("compression");
const methodOverride 	= require("method-override");
const helmet 			= require("helmet");
const crossdomain 		= require("helmet-crossdomain");
const mongoose 			= require("mongoose");
const MongoStore 		= require("connect-mongo")(session);
const RateLimit 		= require("express-rate-limit");
const i18next 			= require("i18next");
const i18nextExpress 	= require("i18next-express-middleware");
const i18nextFs 		= require("i18next-node-fs-backend");

const serverFolder = path.normalize(path.join(config.rootPath, "server"));

/**
 * Initialize local variables
 * 
 * @param {any} app
 */
function initLocalVariables(app) {
	// Setting application local variables
	app.locals.app = config.app;

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + "://" + req.headers.host + req.url;
		return next();
	});

	app.locals.year = moment().format("YYYY");
	app.locals.features = config.features;
}

/**
 * Initialize middlewares
 * 
 * @param {any} app
 */
function initMiddleware(app) {
	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return /json|text|javascript|css/.test(res.getHeader("Content-Type"));
		},
		level: 3,
		threshold: 512
	}));

	// Configure express app
	app.set("port", config.port);

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true,
		limit: config.contentMaxLength * 2
	}));
	app.use(validator());
	app.use(bodyParser.json());	
	app.use(methodOverride());

	if (config.isProductionMode()) {

		// HTTP/2 Server Push support
		app.use(netjet({
			cache: {
				max: 100
			}
		}));

		// Setting up static folder
		app.use(express["static"](path.join(serverFolder, "public")));
	}

	// Favicon
	app.use(favicon(path.join(serverFolder, "public", "favicon.ico")));

	// Cookie parser should be above session
	app.use(cookieParser());

	app.set("etag", true); // other values 'weak', 'strong'

	app.use(flash());	

	if (config.isDevMode()) {
		// Init morgan
		let stream = require("stream");
		let lmStream = new stream.Stream();

		lmStream.writable = true;
		lmStream.write = function(data) {
			return logger.debug(data);
		};	

		app.use(morgan("dev", {
			stream: lmStream
		}));

		// app.use(require('express-status-monitor')());
	}

	app.enable("trust proxy"); // if behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)

	// Rate limiter
	const apiLimiter = new RateLimit({
		windowMs: 1*60*1000, // 1 minute
		max: 50,
		delayMs: 0 // disabled
	});
	
	app.use("/api", apiLimiter);
}

/**
 * Initialize i18next module for localization
 * 
 * @param {any} app
 */
function initI18N(app) {

	let conf = {
		//debug: true,
		fallbackLng: "en",
		whitelist: ["en", "hu"],
		ns: ["app", "frontend"],
		defaultNS: "frontend",
		load: "all",
		saveMissing: true, //config.isDevMode(),
		saveMissingTo: "all", // "fallback", "current", "all"

		backend: {
			// path where resources get loaded from
			loadPath: path.join(serverFolder, "locales", "{{lng}}", "{{ns}}.json"),

			// path to post missing resources
			addPath: path.join(serverFolder, "locales", "{{lng}}", "{{ns}}.missing.json"),

			// jsonIndent to use when storing json files
			jsonIndent: 4
		}
	};

	// In test mode only English enabled!
	if (config.isTestMode()) {
		conf.whitelist = ["en"];
	}

	i18next
		.use(i18nextFs)
		.use(i18nextExpress.LanguageDetector)
		.init(conf, function(err, t) {
			app.t = t;
			if (err)
				logger.warn(err);
		});

	/*i18next.on("languageChanged", function(lng) {
		console.log("languageChanged", lng);
	});

	i18next.on("loaded", function(loaded) {
		console.log("loaded", loaded);
	});	*/

	i18next.on("failedLoading", function(lng, ns, msg) {
		console.log("failedLoading", lng, ns, msg);
	});

	app.use(i18nextExpress.handle(i18next));

	// multiload backend route
	app.get("/locales/resources.json", i18nextExpress.getResourcesHandler(i18next));	

	// missing keys
	app.post("/locales/add/:lng/:ns", i18nextExpress.missingKeyHandler(i18next));		
}

/**
 * Initialize view engine (pug)
 * 
 * @param {any} app
 */
function initViewEngine(app) {
	// Set view folder
	app.set("views", path.join(serverFolder, "views"));
	app.set("view engine", "pug");

	// Environment dependent middleware
	if (config.isDevMode()) {
		app.set("showStackError", true);

		// Disable views cache
		app.set("view cache", false);
		app.use(helmet.noCache());

		// Jade options: Don't minify html, debug intrumentation
		app.locals.pretty = true;
		//app.locals.compileDebug = true;

	} else {
		app.locals.cache = "memory";
		app.set("view cache", true);
	}
}

/**
 * Initialize session handler (mongo-store)
 * 
 * @param {any} app
 * @param {any} db
 */
function initSession(app, db) {
	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: false,
		secret: config.sessionSecret,
		store: new MongoStore({
			mongooseConnection: db.connection,
			collection: config.sessions.collection,
			autoReconnect: true
		}),
		cookie: config.sessions.cookie,
		name: config.sessions.name
	}));
}

/**
 * Initiliaze Helmet security module
 * 
 * @param {any} app
 */
function initHelmetHeaders(app) {
	// Use helmet to secure Express headers
	app.use(helmet.xssFilter());
	app.use(helmet.noSniff());
	app.use(helmet.frameguard());
	app.use(helmet.ieNoOpen());
	app.use(crossdomain());
	app.use(helmet.hidePoweredBy());
}

/**
 * Initialize authentication & CSRF
 * 
 * @param {any} app
 */
function initAuth(app) {
	// Init auth
	require("./auth/passport")(app);

	if (!config.isTestMode()) {
/*
		// Handle CSRF
		app.use(csrf());

		// Keep user, csrf token and config available
		app.use(function(req, res, next) {
			let token = req.csrfToken();
			res.locals._csrf = token;
			res.cookie('XSRF-TOKEN', token);

			return next();
		});*/
	}
}

/**
 * Initialize Webpack hot reload module.
 * 	Note: Only in development mode 
 * 
 * @param {any} app
 */
function initWebpack(app) {
	// Webpack middleware in development mode
	if (!config.isProductionMode()) {
		let webpack	 = require("webpack");
		let wpConfig = require("../../../build/webpack.dev.config");

		let compiler = webpack(wpConfig);
		let devMiddleware = require('webpack-dev-middleware'); // eslint-disable-line
		app.use(devMiddleware(compiler, {
			noInfo: true,
			publicPath: wpConfig.output.publicPath,
			headers: { "Access-Control-Allow-Origin": "*" },
			//stats: 'errors-only'
			stats: {colors: true}
		}));

		let hotMiddleware = require('webpack-hot-middleware'); // eslint-disable-line
		app.use(hotMiddleware(compiler, {
			log: logger.info
		}));
	}
}

module.exports = function(db, service) {

	// Create express app
	let app = express();

	// Init local variables
	initLocalVariables(app);

	// Init middlewares
	initMiddleware(app);

	// Init view engine
	initViewEngine(app);

	// Init Helmet security headers
	initHelmetHeaders(app);

	// Init internationalization module
	initI18N(app);

	// Init session handler
	initSession(app, db);

	// Init auth and CSRF module
	initAuth(app);

	// Init webpack devserver & hot reload module
	initWebpack(app);

	// Load socket.io server
	let server = require("./sockets").init(app, db, service);

	// Load routes
	require("./routes")(app, db, service);

	return { server, app };
};
