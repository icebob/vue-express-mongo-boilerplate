"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");
let E 			= require("../../../core/errors");

let _			= require("lodash");

let Device 		= require("./models/device");

module.exports = {
	name: "devices",
	version: 1,
	settings: {
		latestVersion: true,
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		collection: Device,
		
		hashedIdentity: true,
		modelPropFilter: "code type address name description status lastCommunication createdAt updatedAt"
	},
	
	actions: {
		list: {
			cache: true,
			defaultMethod: "get",
			handler(ctx) {
				let filter = {};

				let query = this.collection.find(filter);

				return this.applyFilters(query, ctx).exec()
				.then(docs => this.toJSON(docs))
				.then(json => this.populateModels(ctx, json));
			}
		},

		// return a model by ID
		get: {
			cache: true,
			defaultMethod: "get",
			needModel: true,
			handler(ctx) {
				return Promise.resolve(ctx)
				.then(ctx => ctx.call(this.name + ".model", { code: ctx.params.code }))
				.then(model => this.checkModel(model, "app:DeviceNotFound"));
			}
		},

		model: {
			cache: true,
			publish: false,
			handler(ctx) {
				return this.resolveModel(ctx);
			}
		},

		create: {
			defaultMethod: "post",
			handler(ctx) {
				return Promise.resolve(ctx)
				.then(() => {
					let device = new Device({
						address: ctx.params.address,
						type: ctx.params.type,
						name: ctx.params.name,
						description: ctx.params.description,
						status: ctx.params.status
					});

					return device.save();
				})
				.then(doc => this.toJSON(doc))
				.then(json => this.populateModels(ctx, json))
				.then(json => {
					//this.notifyModelChanges(ctx, "created", json);
					return json;
				});	
			}
		},

		update: {
			defaultMethod: "put",
			needModel: true,
			handler(ctx) {
				return Promise.resolve(ctx)
				.then(ctx => ctx.call(this.name + ".model", { code: ctx.params.code }))
				.then(model => this.checkModel(model, "app:DeviceNotFound"))
				.then(model => this.collection.findById(model.id).exec())
				.then(doc => {

					if (ctx.params.address != null)
						doc.address = ctx.params.address;

					if (ctx.params.type != null)
						doc.type = ctx.params.type;

					if (ctx.params.name != null)
						doc.name = ctx.params.name;

					if (ctx.params.description != null)
						doc.description = ctx.params.description;

					if (ctx.params.status != null)
						doc.status = ctx.params.status;

					return doc.save();
				})
				.then(doc => this.toJSON(doc))
				.then(json => this.populateModels(ctx, json))
				.then((json) => {
					//this.notifyModelChanges(ctx, "updated", json);
					return json;
				});	
			}							
		},

		remove: {
			defaultMethod: "delete",
			needModel: true,
			handler(ctx) {
				return Promise.resolve(ctx)
				.then(ctx => ctx.call(this.name + ".model", { code: ctx.params.code }))
				.then(model => this.checkModel(model, "app:DeviceNotFound"))
				.then(model => {
					return this.collection.remove({ _id: model.id }).then(() => model);
				})
				.then((json) => {
					//this.notifyModelChanges(ctx, "removed", json);
					return json;
				});		
			}
		}

	},

	// Event listeners
	events: {

	},

	// Service methods
	methods: {

	},

	created() {
		// this.logger.info("Service created!");
	},

	started() {
		// this.logger.info("Service started!");
	},

	stopped() {
		// this.logger.info("Service stopped!");
	},

	graphql: {

		query: `
			devices(limit: Int, offset: Int, sort: String): [Device]
			device(code: String): Device
		`,

		types: `
			type Device {
				code: String!
				address: String
				type: String
				name: String
				description: String
				status: Int
				lastCommunication: Timestamp
			}
		`,

		mutation: `
			deviceCreate(name: String!, address: String, type: String, description: String, status: Int): Device
			deviceUpdate(code: String!, name: String, address: String, type: String, description: String, status: Int): Device
			deviceRemove(code: String!): Device
		`,

		resolvers: {
			Query: {
				devices: "find",
				device: "get"
			},

			Mutation: {
				deviceCreate: "create",
				deviceUpdate: "update",
				deviceRemove: "remove"
			}
		}
	}

};

/*
## GraphiQL test ##

# Find all devices
query getDevices {
  devices(sort: "lastCommunication", limit: 5) {
    ...deviceFields
  }
}

# Create a new device
mutation createDevice {
  deviceCreate(name: "New device", address: "192.168.0.1", type: "raspberry", description: "My device", status: 1) {
    ...deviceFields
  }
}

# Get a device
query getDevice($code: String!) {
  device(code: $code) {
    ...deviceFields
  }
}

# Update an existing device
mutation updateDevice($code: String!) {
  deviceUpdate(code: $code, address: "127.0.0.1") {
    ...deviceFields
  }
}

# Remove a device
mutation removeDevice($code: String!) {
  deviceRemove(code: $code) {
    ...deviceFields
  }
}

fragment deviceFields on Device {
    code
    address
    type
    name
    description
    status
    lastCommunication
}

*/