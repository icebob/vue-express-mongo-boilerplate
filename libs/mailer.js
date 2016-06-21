"use strict";

let config    	= require("../config");
let logger    	= require('../core/logger');
let nodemailer 	= require("nodemailer");
let htmlToText 	= require('nodemailer-html-to-text').htmlToText;

module.exports = {
	send: function(recipients, subject, body, cb) {
		logger.info(`Sending email to ${recipients} with subject ${subject}...`);

		let mailOptions = {
			from: config.mailer.from,
			to: recipients,
			subject: subject,
			html: body,
		};

		let transporter;
		if (config.mailer.transport == "smtp") {
			transporter = nodemailer.createTransport(config.mailer.smtp);
		}
		else if (config.mailer.transport == "mailgun") {
			let mg = require('nodemailer-mailgun-transport');
			transporter = nodemailer.createTransport(mg({
				auth: {
					api_key: config.mailer.mailgun.apiKey,
					domain: config.mailer.mailgun.domain
				}
			}));
		}
		else if (config.mailer.transport == "sendgrid") {
			let sgTransport = require('nodemailer-sendgrid-transport');
			transporter = nodemailer.createTransport(sgTransport({
				auth: {
					api_key: config.mailer.sendgrid.apiKey
				}
			}));
		}

		if (transporter) {
			transporter.use('compile', htmlToText());
			transporter.sendMail(mailOptions, (err, info) => {
				if (err)
					return logger.warn("Unable to send email: ", err);

				logger.info("Email message sent.", info.response);
				if (cb)
					cb(err, info);
			});
		}
		else 
			logger.warn("Unable to send email! Invalid mailer transport: " + config.mailer.transport);
	}
}