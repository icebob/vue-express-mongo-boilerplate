"use strict";

let config 			= require("../config");
let logger 			= require("../core/logger");
let auth 			= require("../core/auth/helper");
let ApolloServer 	= require("apollo-server").apolloServer;
let graphqlTools 	= require("graphql-tools");
let Schema 			= require("../schema").schema;
let Resolvers 		= require("../schema").resolvers;

module.exports = function(app, db) {

	let schema = graphqlTools.makeExecutableSchema({ typeDefs: Schema, resolvers: Resolvers });
	//console.log(schema);

	// Register graphql server
	app.use("/graphql", auth.isAuthenticatedOrApiKey, ApolloServer( (req) => {
		const query = req.query.query || req.body.query;
		if (query && query.length > 2000) {
			// None of our app's queries are this long
			// Probably indicates someone trying to send an overly expensive query
			throw new Error("Query too large.");
		}	
		logger.debug("GraphQL query:", query);

		return {
			graphiql: config.isDevMode(),
			pretty: config.isDevMode(),
			printErrors: config.isDevMode(),
			schema: schema,
			//schema: Schema,
			//resolvers: Resolvers,
			context: {
				req: req,
				t: req.t,
				user: req.user,
				session: req.session
			}
		};
	}));

};