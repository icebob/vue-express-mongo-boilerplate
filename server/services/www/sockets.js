"use strict";

let logger 			= require("../../core/logger");
let config 			= require("../../config");

let	path 			= require("path");
let	fs 				= require("fs");
let	http 			= require("http");
let _ 				= require("lodash");

let	cookieParser 	= require("cookie-parser");
let	passport 		= require("passport");
let	socketio 		= require("socket.io");
let	session 		= require("express-session");
let	MongoStore 		= require("connect-mongo")(session);

let self = {
	/**
	 * IO server instance
	 * We will assign it in `init`
	 */
	IO: null,

	/**
	 * Service broker instance
	 * We will assign it in `init`
	 */
	broker: null,

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
	 * @param  {Service} service  WWW service instance
	 */
	init(app, db, service) {
		self.service = service;
		self.broker = service.broker;

		// Create a MongoDB session store object
		self.mongoStore = new MongoStore({
			mongooseConnection: db.connection,
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

		self.broker.on("socket.emit.client", ({ socketID, event, payload }) => {
			self.broker.logger.debug("Send WS broadcast message to '" + event + "':", payload);
			let socket = self.IO.sockets.connected[socketID];
			if (socket)
				socket.emit(event, payload);
		});

		// send to specific user

		self.broker.on("socket.emit.user", ({ username, event, payload }) => {
			self.broker.logger.debug("Send WS message to '" + username + "':", payload);

			// will send to ALL users that are logged into that account

			_.map(self.userSockets,  function(c){
				if(c.request.user.username === username){
					let socket = self.IO.sockets.connected[c.id];
					if (socket) {
						socket.emit(event, payload);
					}
				}
			});
		});

		self.broker.on("socket.emit.role", ({ role, event, payload }) => {
			self.IO.emit(event, payload); // TODO only for role
		});

		self.broker.on("socket.emit", ({ event, payload }) => {
			self.IO.emit(event, payload);
		});

		return server;
	},

	/**
	 * Create a new Socket.IO namespace
	 *
	 * @param {any} ns		name of namespace
	 * @param {any} role	required role for namespace
	 * @returns
	 */
	createNameSpace(ns, role) {
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
			let payload = {
				ns: ns,
				socketID: socket.id,
				user: _.pick(socket.request.user, ["id", "username", "fullName", "roles"])
			};

			self.broker.emit("socket.client.connected", payload);

			self.addOnlineUser(socket);
			logger.debug(`WS client connected to namespace ${ns}! User: ${socket.request.user.username}`);

			socket.on("disconnect", function() {
				self.broker.emit("socket.client.disconnected", payload);
				self.removeSocket(socket);
				logger.debug(`WS client disconnected from namespace ${ns}!`);
			});

			self.service.registerSocketActions(socket, io);
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
