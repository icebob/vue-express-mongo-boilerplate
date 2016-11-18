"use strict";

let pkg = require("../../package.json");

module.exports = {
	app: {
		title: pkg.name + " [Test mode]"
	},
	
	hashSecret: "71IIYMzMb0egTaCvvdijhUajAOjsrurzyRX5ziskMk4",
	sessionSecret: "MB9x-hOkx-UdcCbOprxggu-Wv1PetuoqzBny1h8DULA",

	mailer: {
		from: "noreply@vem-app.com",

		transport: "smtp",
		smtp: {
			host: "mailtrap.io",
			port: 2525,
			auth: {
				user: "367335eaa82697636",
				pass: "e5a76af9b056d0"
			}
		}
	},
	
	test: true,

	db: {
		uri: "mongodb://localhost/" + pkg.config.dbName + "-test",
		options: {
			user: "",
			pass: ""
		}
	}
};