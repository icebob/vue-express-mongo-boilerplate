module.exports = {
	
	hashSecret: "{{hashSecret}}",
	sessionSecret: "{{sessionSecret}}",

	app: {
		//title: "VEM APP",
		//version: "1.0.0",
		//description: "This is my boilerplate web app",
		//keywords: "boilerplate, starter, webapp",
		//url: "http://localhost:3000/",
		//googleAnalyticsID: 'UA-xxxxx-x',
		//contactEmail: "hello@vem-app.com"
	},

	// ip: process.env.NODE_IP || "127.0.0.1",
	// port: process.env.NODE_PORT || 3000,

	db: {
		// uri: process.env.MONGO_URI || "mongodb://localhost/vemapp",
		options: {
			user: process.env.MONGO_USERNAME || "",
			pass: process.env.MONGO_PASSWORD || ""
		}
	},

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

