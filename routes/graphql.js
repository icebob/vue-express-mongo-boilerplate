"use strict";

let config 	= require("../config");
let logger 	= require("../core/logger");
let auth 	= require("../core/auth/helper");
let ApolloServer = require("apollo-server").apolloServer;
let Schema = require("../schema/schema");
let Resolvers = require("../schema/resolvers");

module.exports = function(app, db) {

	// Register graphql server
	app.use("/graphql", auth.isAuthenticatedOrApiKey, ApolloServer( (req) => ({
		graphiql: config.isDevMode(),
		pretty: config.isDevMode(),
		printErrors: config.isDevMode(),
		schema: Schema,
		resolvers: Resolvers,
		context: {
			user: req.user,
			session: req.session
		}
	})
	));

};