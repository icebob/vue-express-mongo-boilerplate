"use strict";

let logger 			= require("./logger");
let config 			= require("../config");

let	path 			= require("path");
let	fs 				= require("fs");
let	http 			= require("http");
let _ 				= require("lodash");

let	cookieParser 	= require("cookie-parser");
let	passport 		= require("passport");
let	socketio 		= require("socket.io");
let	session 		= require("express-session");
let	MongoStore 		= require("connect-mongo")(session);

let Services; // circular references

let self = {
	/**
	 * IO server instance
	 * We will assign it in `init`
	 */
	IO: null,

	/**
	 * Mongo store instance.
	 * We will assign it in `init`
	 */
	mongoStore: null,

	/**
	 * IO namespaces
	 * @type {Object}
	 */
	namespaces: {},

	/**
	 * List of logged in online users/sockets
	 * @type {Array}
	 */
	userSockets: [],

	/**
	 * Init Socket.IO module and load socket handlers
	 * from applogic
	 *
	 * @param  {Object} app Express App
	 * @param  {Object} db  MongoDB connection
	 */
	init(app, db) {
		// Create a MongoDB storage object
		self.mongoStore = new MongoStore({
			mongooseConnection: db,
			collection: config.sessions.collection,
			autoReconnect: true
		});

		// Create a new HTTP server
		let server = http.createServer(app);

		// Create a new Socket.io server
		let IO = socketio(server);

		app.io = self;
		self.IO = IO;

		// Add common handler to the root namespace
		self.initNameSpace("/", IO, self.mongoStore);
		IO.on("connection", function (socket) {
			socket.on("welcome", function(msg) {
				logger.info("Incoming welcome message from " + socket.request.user.username + ":", msg);
			});
		});

		let services = require("./services");
		services.registerSockets(IO, self);

		return server;
	},

	/**
	 * Create a new Socket.IO namespace
	 *
	 * @param {any} ns		name of namespace
	 * @param {any} role	required role for namespace
	 * @returns
	 */
	addNameSpace(ns, role) {
		let io = self.namespaces[ns];
		if (io == null) {
			io = self.IO.of(ns);
			self.initNameSpace(ns, io, self.mongoStore, role);
		}

		return io;
	},

	/**
	 * Initialize IO namespace. Apply authentication middleware
	 *
	 * @param  {String} ns         		Name of namespace
	 * @param  {Object} io         		IO instance
	 * @param  {Object} mongoStore 		Mongo Session store
	 * @param  {Object} roleRequired 	required role
	 */
	initNameSpace(ns, io, mongoStore, roleRequired) {

		// Intercept Socket.io's handshake request
		io.use(function (socket, next) {
			// Use the 'cookie-parser' module to parse the request cookies
			cookieParser(config.sessionSecret)(socket.request, {}, function (err) {
				// Get the session id from the request cookies
				let sessionId = socket.request.signedCookies ? socket.request.signedCookies[config.sessions.name] : undefined;

				if (!sessionId) {
					logger.warn("sessionId was not found in socket.request");
					return next(new Error("sessionId was not found in socket.request"), false);
				}

				// Use the mongoStorage instance to get the Express session information
				mongoStore.get(sessionId, function (err, session) {
					if (err) return next(err, false);
					if (!session) return next(new Error("session was not found for " + sessionId), false);

					// Set the Socket.io session information
					socket.request.session = session;

					// Set the socketID to session
					session.socket = socket.id;
					mongoStore.set(sessionId, session);

					// Use Passport to populate the user details
					passport.initialize()(socket.request, {}, function () {
						passport.session()(socket.request, {}, function () {
							if (socket.request.user) {
								let user = socket.request.user;

								if (roleRequired) {
									if (user.roles && user.roles.indexOf(roleRequired) !== -1)
										next(null, true);
									else {
										logger.warn(`Websocket user has no access to this namespace '${ns}'!`, user.username);
										next(new Error(`You have NO access to this namespace '${ns}'!`), false);
									}
								}
								else
									next(null, true);

							} else {
								logger.warn("Websocket user is not authenticated!");
								next(new Error("User is not authenticated! Please login first!"), false);
							}
						});
					});
				});
			});
		});

		// Add an event listener to the 'connection' event
		io.on("connection", function (socket) {
			if (!Services)
				Services = require("./services");

			Services.emit("socket:connect", socket);
			self.addOnlineUser(socket);
			logger.debug("WS client connected to namespace " + (io.name || "root") + "! User: " + socket.request.user.username);

			socket.on("disconnect", function() {
				Services.emit("socket:connect", socket);
				self.removeSocket(socket);
				logger.debug("WS client disconnected from namespace " + (io.name || "root") + "!");
			});
		});

		self.namespaces[ns] = io;
	},

	/**
	 * Emit a message to a namespace
	 *
	 * @param {any} namespace
	 * @param {any} command
	 * @param {any} data
	 * @returns
	 */
	nsEmit(namespace, command, data) {
		if (self.namespaces[namespace]) {
			self.namespaces[namespace].emit(command, data);
			return true;
		}
	},

	/**
	 * Add a socket to the online users list
	 *
	 * @param {any} socket
	 */
	addOnlineUser(socket) {
		self.removeOnlineUser(socket);
		self.userSockets.push(socket);
	},

	/**
	 * Remove a socket from the online users
	 *
	 * @param {any} socket
	 */
	removeSocket(socket) {
		_.remove(self.userSockets, function(s) { return s == socket; });
	},

	/**
	 * Remove sockets of user from the online users
	 *
	 * @param {any} socket
	 */
	removeOnlineUser(socket) {
		_.remove(self.userSockets, function(s) { return s.request.user._id == socket.request.user._id; });
	}

};

module.exports = self;
