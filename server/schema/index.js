"use strict";

let logger 			= require("../core/logger");
let config 			= require("../config");
let graphqlTools 	= require("graphql-tools");
let path 			= require("path");
let chalk 			= require("chalk");
let _ 				= require("lodash");

let moduleQueries = [];
let moduleTypeDefinitions = [];
let moduleMutations = [];
let moduleResolvers = [];

logger.info("");
logger.info(chalk.bold("Search GraphQL schemas..."));

// --- LOAD MODULE SCHEMAS

let files = config.getGlobbedFiles(path.join(__dirname, "**", "*schema.js"));
files = files.concat(config.getGlobbedFiles(path.join(__dirname, "..", "applogic", "modules", "**", "*schema.js")));

// Load schema files
files.forEach((file) => {
	logger.info("  Load", path.relative(path.join(__dirname, "..", "applogic", "modules"), file), "schema...");
	let moduleSchema = require(path.resolve(file));

	moduleQueries.push(moduleSchema.schema.query);
	moduleTypeDefinitions.push(moduleSchema.schema.typeDefinitions);
	moduleMutations.push(moduleSchema.schema.mutation);

	moduleResolvers.push(moduleSchema.resolvers);
});

// --- MERGE TYPE DEFINITONS

const schema = `

scalar Timestamp

type Query {
	${moduleQueries.join("\n")}
}

${moduleTypeDefinitions.join("\n")}

type Mutation {
	${moduleMutations.join("\n")}
}

schema {
  query: Query
  mutation: Mutation
}
`;

// --- MERGE RESOLVERS

function mergeModuleResolvers(baseResolvers) {
	moduleResolvers.forEach((module) => {
		baseResolvers = _.merge(baseResolvers, module);
	});

	return baseResolvers;
}

module.exports = {
	schema: [schema],
	resolvers: mergeModuleResolvers({

		Timestamp: {
			__parseValue(value) {
				return new Date(value);
			},
			__serialize(value) {
				return value.getTime();
			},
			__parseLiteral(ast) {
				console.log(ast); // ???? when will be called it?
				/*if (ast.kind === Kind.INT) {
					return parseInt(ast.value, 10);
				}*/
			}
		}

	})
};

