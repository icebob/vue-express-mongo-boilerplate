	"use strict";

let path = require("path");
let pkg = require("../../package.json");

module.exports = {
	app: {
		title: pkg.title,
		version: pkg.version,
		description: pkg.description,
		keywords: pkg.keywords.join(","),
		url: "http://localhost:" + (process.env.PORT || 3000) + "/",
		//googleAnalyticsID: 'UA-xxxxx-x',
		contactEmail: "hello@vem-app.com"
	},

	ip: process.env.NODE_IP || "0.0.0.0",
	port: process.env.PORT || 3000,

	rootPath: global.rootPath,
	dataFolder: path.join(global.rootPath, "data"),

	uploadLimit: 2 * 1024 * 1024, // 2MB

	sessions: {
		cookie: {
			// session expiration is set by default to one week
			maxAge: 7 * 24 * (60 * 60 * 1000),

			// httpOnly flag makes sure the cookie is only accessed
			// through the HTTP protocol and not JS/browser
			httpOnly: true,

			// secure cookie should be turned to true to provide additional
			// layer of security so that the cookie is set only when working
			// in HTTPS mode.
			secure: false
		},

		// Cookie key name
		name: "sessionId",

		// Mongo store collection name
		collection: "sessions"
	},

	test: false,

	db: {
		uri: process.env.MONGO_URI || "mongodb://localhost/" + pkg.config.dbName + "-dev",
		options: {
			user: "",
			pass: "",
			keepAlive: 1,
			useNewUrlParser: true
		}
	},

	redis: {
		enabled: false,
		uri: process.env.REDIS_URI || "redis://localhost:6379",
		options: null
	},

	cacheTimeout: 5 * 60, // 5 mins

	mailer: {
		enabled: false, // change this flag to true to turn emailing feature on.

		//if enabled = true make sure to configure one of the methods below
		from: "noreply@vem-app.com"
		/*
		transport: "smtp",
		smtp: {
			host: "mailtrap.io",
			port: 2525,
			auth: {
				user: "",
				pass: ""
			}
		}*/

		/*transport: "smtp",
		smtp: {
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: "",
				pass: ""
			}
		}*/

		/*
		transport: "mailgun",
		mailgun: {
			apiKey: '',
			domain: ''
		}*/

		/*
		transport: "sendgrid",
		sendgrid: {
			apiKey: ""
		}*/
	},

	features: {
		disableSignUp: false,
		verificationRequired: true
	},

	authKeys: {

		google: {
			clientID: null,
			clientSecret: null
		},

		facebook: {
			clientID: null,
			clientSecret: null
		},

		github: {
			clientID: null,
			clientSecret: null
		},

		twitter: {
			clientID: null,
			clientSecret: null
		}
	},

	logging: {
		console: {
			level: "debug"
		},

		file: {
			enabled: false,
			path: path.join(global.rootPath, "logs"),
			level: "info",
			json: false,
			exceptionFile: true
		},

		graylog: {
			enabled: false
			// servers: [ { host: "192.168.0.174", port: 12201 } ]
		},

		papertrail: {
			enabled: false,
			host: null,
			port: null,
			level: "debug",
			program: "vem"
		},

		logentries: {
			enabled: false,
			token: null
		},

		loggly: {
			enabled: false,
			token: null,
			subdomain: null
		},

		logsene: {
			enabled: false,
			token: null
		},

		logzio: {
			enabled: false,
			token: null
		}

	},

	agendaTimer: "one minute"
};
