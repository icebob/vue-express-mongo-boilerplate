"use strict";

let config 	= require("../config");
let logger 	= require("../core/logger");
let ApolloServer = require("apollo-server").apolloServer;
let Schema = require("../schema/schema");
let Mocks = require("../schema/mocks");
let Resolvers = require("../schema/resolvers");

module.exports = function(app, db) {

	// Register graphql server
	app.use('/graphql', ApolloServer({
		graphiql: true,
		pretty: true,
		schema: Schema,
		//mocks: Mocks
		resolvers: Resolvers
	}));

};