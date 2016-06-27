'use strict';

let logger 			= require('./logger');
let config 			= require("../config");
let secrets 		= require("./secrets");

let	path 			= require('path');
let	fs 				= require('fs');
let	http 			= require('http');

let	cookieParser 	= require('cookie-parser');
let	passport 		= require('passport');
let	socketio 		= require('socket.io');
let	session 		= require('express-session');
let	MongoStore 		= require('connect-mongo')(session);

let socketHandlers  = require('../applogic/socketHandlers');
// Define the Socket.io configuration method
module.exports = function (app, db) {

	// Create a new HTTP server
	let server = http.createServer(app);

	// Create a new Socket.io server
	var io = socketio(server);

	// Create a MongoDB storage object
	var mongoStore = new MongoStore({
		mongooseConnection: db.connection,
		collection: config.sessions.collection,
		autoReconnect: true
	});

	// Intercept Socket.io's handshake request
	io.use(function (socket, next) {
		// Use the 'cookie-parser' module to parse the request cookies
		cookieParser(secrets.sessionSecret)(socket.request, {}, function (err) {
			// Get the session id from the request cookies
			var sessionId = socket.request.signedCookies ? socket.request.signedCookies[config.sessions.name] : undefined;

			if (!sessionId) {
				logger.warn('sessionId was not found in socket.request');
				return next(new Error('sessionId was not found in socket.request'), false);
			}

			// Use the mongoStorage instance to get the Express session information
			mongoStore.get(sessionId, function (err, session) {
				if (err) return next(err, false);
				if (!session) return next(new Error('session was not found for ' + sessionId), false);

				// Set the Socket.io session information
				socket.request.session = session;

				// Use Passport to populate the user details
				passport.initialize()(socket.request, {}, function () {
					passport.session()(socket.request, {}, function () {
						if (socket.request.user) {
							next(null, true);
						} else {
							logger.warn('Websocket user is not authenticated!');
							next(new Error('User is not authenticated'), false);
						}
					});
				});
			});
		});
	});

	// Add an event listener to the 'connection' event
	io.on('connection', function (socket) {
		logger.debug("WS client connected! User: " + socket.request.user.username);

		socket.on('disconnect', function() {
			logger.debug("WS client disconnected!");
		});

		// Add an event listener to the 'connection' event
		socketHandlers.handlers.forEach((handler) => {
			require(path.resolve(handler))(io, socket);
		});

	});

	server.io = io;

	return server;
};
