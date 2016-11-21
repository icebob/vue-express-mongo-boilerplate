"use strict";

let MAILTRAP_API = "73b2335b4810550097cec6291bc91c03";
let MAILTRAP_INBOX = 46372;

let _ = require("lodash");
let request = require("request");

let baseURL = "https://mailtrap.io/api/v1/";
let headers = {
	"Content-Type": "application/json",
	"Api-Token": MAILTRAP_API
};

function getMessages(inboxID, email, done) {
	inboxID = inboxID || MAILTRAP_INBOX;

	let options = {
		method: "GET",
		url: baseURL + "/inboxes/" + inboxID + "/messages",
		headers: headers
	};

	request(options, function (error, response, body) {
		if (error)
			return done(error);

		if (response.statusCode >= 400)
			return done("Response error:" + response.statusCode + " " + response.statusMessage);

		let messages = [];

		let result = JSON.parse(body);

		_.each(result, function(msg) {
			if (email == null || msg.to_email == email)
				messages.push(msg);
		});

		done(null, messages);
	});
}

function getTokenFromMessage(email, re, done) {
	getMessages(null, email, function(err, messages) {
		if (err) 
			return done(err);

		if (messages.length < 1)
			return done("Passwordless email not received!");
		
		let msg = messages[0];
		// Get the last email body
		let body = msg.html_body;

		let match = re.exec(body);
		if (match)
			return done(null, match[1], msg);

		return done("Token missing from email! " + body);
	});
}

function cleanInbox(inboxID, done) {
	inboxID = inboxID || MAILTRAP_INBOX;
	if (!done)
		done = function(err) {
			if (err)
				console.error(err);
		};

	let options = {
		method: "PATCH",
		url: baseURL + "/inboxes/" + inboxID + "/clean",
		headers: headers
	};

	request(options, function (error, response, body) {
		if (error)
			return done(error);

		if (response.statusCode >= 400)
			return done("Response error:" + response.statusCode + " " + response.statusMessage);

		done();
	});
}

function deleteMessage(inboxID, messageID, done) {
	inboxID = inboxID || MAILTRAP_INBOX;
	if (!done)
		done = function(err) {
			if (err)
				console.error(err);
		};

	let options = {
		method: "DELETE",
		url: baseURL + "/inboxes/" + inboxID + "/messages/" + messageID,
		headers: headers
	};

	request(options, function (error, response, body) {
		if (error)
			return done(error);

		if (response.statusCode >= 400)
			return done("Response error:" + response.statusCode + " " + response.statusMessage);

		done();
	});
}

/*
getMessages(MAILTRAP_INBOX, "test@boilerplate-app.com", function(err, body) {
	console.error(err);
	console.log(body);
});
*/

module.exports = {
	getMessages,
	getTokenFromMessage,
	cleanInbox,
	deleteMessage
};