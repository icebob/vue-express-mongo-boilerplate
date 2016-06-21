"use strict";

let path = require('path');
let pkg = require("../package.json");

let rootPath = path.normalize(path.join(__dirname, ".."));

module.exports = {
	app: {
		title: pkg.name,
		version: pkg.version,
		description: pkg.description,
		keywords: pkg.keywords.join(","),
		url: 'http://localhost:3000/',
		googleAnalyticsID: 'UA-xxxxx-x'
	},

	ip: '0.0.0.0',
	port: process.env.PORT || 3000,
	rootPath: rootPath,
	dataFolder: path.join(rootPath, "data"),
	uploadLimit: 2 * 1024 * 1024, // 2MB

	sessions: {
		cookie: {
			// session expiration is set by default to 24 hours
			maxAge: 24 * (60 * 60 * 1000),

			// httpOnly flag makes sure the cookie is only accessed
			// through the HTTP protocol and not JS/browser
			httpOnly: true,

			// secure cookie should be turned to true to provide additional
			// layer of security so that the cookie is set only when working
			// in HTTPS mode.
			secure: false
		},

		// Cookie key name
		name: 'sessionId',

		// Mongo store collection name
		collection: 'sessions',
	},

	test: false,

	mailer: {
		from: "noreply@bolierplate-app.com",

		transport: "smtp",
		smtp: {
			host: "mailtrap.io",
			port: 2525,
			auth: {
				user: "367335eaa82697636",
				pass: "e5a76af9b056d0"
			}
		}

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

	db: {
		uri: process.env.MONGO_URI || "mongodb://localhost/" + pkg.config.dbName + "-dev",
		options: {
			user: '',
			pass: '',
			server: {
				socketOptions: {
					keepAlive: 1
				}
			}
		}

	}
};