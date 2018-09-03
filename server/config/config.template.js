"use strict";

let path = require("path");
let pkg = require("./package.json");

module.exports = {

	// Secret for ID hashing
	hashSecret: "{{hashSecret}}",

	// Secret for session hashing
	sessionSecret: "{{sessionSecret}}",

	// Application settings
	app: {
		//title: "VEM APP",
		//version: "1.0.0",
		//description: "This is my boilerplate web app",
		//keywords: "boilerplate, starter, webapp",
		//url: "http://localhost:3000/",
		//googleAnalyticsID: 'UA-xxxxx-x',
		//contactEmail: "hello@vem-app.com"
	},

	// ip: process.env.NODE_IP || "0.0.0.0",
	// port: process.env.NODE_PORT || 3000,

	// dataFolder: path.join(global.rootPath, "data"),
	// logFolder: path.join(global.rootPath, "logs"),

	// Database (Mongo) settings
	db: {
		// uri: process.env.MONGO_URI || "mongodb://localhost/vemapp",
		options: {
			user: process.env.MONGO_USERNAME || "",
			pass: process.env.MONGO_PASSWORD || "",
			useNewUrlParser: true
		}
	},

	// Redis settings for caching
	redis: {
		enabled: false,
		uri: process.env.REDIS_URI || "redis://localhost:6379",
		options: null
	},

	// Mail sending settings
	mailer: {
		//from: "noreply@vem-app.com",

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

	// Features of application
	features: {
		disableSignUp: false,
		verificationRequired: true
	},

	// Social authentication (OAuth) keys
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

	// Logging settings
	logging: {

		console: {
			// level: "debug"
		},

		file: {
			enabled: false,
			// path: path.join(global.rootPath, "logs"),
			// level: "info",
			// json: false,
			// exceptionsSeparateFile: true
		},

		graylog: {
			enabled: false
			// servers: [ { host: "192.168.0.100", port: 12201 } ]
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

	}

};

