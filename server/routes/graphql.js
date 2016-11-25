"use strict";

let config 				= require("../config");
let logger 				= require("../core/logger");
let auth 				= require("../core/auth/helper");
let graphqlExpress 		= require("graphql-server-express").graphqlExpress;
let graphiqlExpress  	= require("graphql-server-express").graphiqlExpress;
let graphqlTools 		= require("graphql-tools");

module.exports = function(app, db) {

	let servicesSchema = require("../core/services").registerGraphQLSchema();
	if (!servicesSchema) return;
	
	let schema = graphqlTools.makeExecutableSchema({ 
		typeDefs: servicesSchema.schema, 
		resolvers: servicesSchema.resolvers,
		logger: config.isDevMode() ? logger : undefined
		//allowUndefinedInResolve: false
	});	
	//console.log(schema);

	// Register graphql server
	app.use("/graphql", graphqlExpress( (req) => {
		const query = req.query.query || req.body.query;
		if (query && query.length > 2000) {
			// None of our app's queries are this long
			// Probably indicates someone trying to send an overly expensive query
			throw new Error("Query too large.");
		}	
		// logger.debug("GraphQL request:", query);

		return {
			//graphiql: config.isDevMode(),
			//pretty: config.isDevMode(),
			//printErrors: config.isDevMode(),
			schema: schema,
			context: {
				req: req,
				query: query,
				t: req.t,
				user: req.user,
				session: req.session
			},
			debug: config.isDevMode(),
			formatError(e) {
				//console.dir(e);
				return {
					status: e.originalError ? e.originalError.status : 400, 
					type: e.originalError ? e.originalError.type : null, 
					message: e.message,
					locations: e.locations,
					path: e.path
				};
			}
			/*
			// function used to format errors before returning them to clients
			formatError?: Function,

			// additional validation rules to be applied to client-specified queries
			validationRules?: Array<ValidationRule>,

			// function applied for each query in a batch to format parameters before passing them to `runQuery`
			formatParams?: Function,

			// function applied to each response before returning data to clients
			formatResponse?: Function,		
			*/	
		};
	}));

	app.use("/graphiql", graphiqlExpress({
		endpointURL: "/graphql",
	}));	

};