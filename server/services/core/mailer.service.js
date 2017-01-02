"use strict";

let logger 		= require("../../core/logger");
let config 		= require("../../config");

let nodemailer 	= require("nodemailer");
let htmlToText 	= require("nodemailer-html-to-text").htmlToText;

module.exports = {
	name: "mailer",
	
	actions: {
		send(ctx) {
			let { recipients, subject, body } = ctx.params;
			return this.send(recipients, subject, body)
				.then(info => ctx.result(info))
				.catch(err => ctx.result(err));
		}
	},

	methods: {
		send(recipients, subject, body) {
			return new Promise((resolve, reject) => {

				/*let recipients = ctx.params.recipients;
				let subject = ctx.params.subject;
				let body = ctx.params.body;*/

				logger.info(`Sending email to ${recipients} with subject ${subject}...`);

				let mailOptions = {
					from: config.mailer.from,
					to: recipients,
					subject: subject,
					html: body
				};

				let transporter;
				if (config.mailer.transport == "smtp") {
					transporter = nodemailer.createTransport(config.mailer.smtp);
				}
				else if (config.mailer.transport == "mailgun") {
					let mg = require("nodemailer-mailgun-transport");
					transporter = nodemailer.createTransport(mg({
						auth: {
							api_key: config.mailer.mailgun.apiKey,
							domain: config.mailer.mailgun.domain
						}
					}));
				}
				else if (config.mailer.transport == "sendgrid") {
					let sgTransport = require("nodemailer-sendgrid-transport");
					transporter = nodemailer.createTransport(sgTransport({
						auth: {
							api_key: config.mailer.sendgrid.apiKey
						}
					}));
				}

				if (transporter) {
					transporter.use("compile", htmlToText());
					transporter.sendMail(mailOptions, (err, info) => {
						if (err) {
							logger.warn("Unable to send email: ", err);
							reject(err);
						} else {
							logger.info("Email message sent.", info.response);
							resolve(info);
						}
					});
				}
				else 
					reject(new Error("Unable to send email! Invalid mailer transport: " + config.mailer.transport));

			});
		}
	}
};
