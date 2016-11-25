"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Device 		= require("./models/device");

module.exports = {
	settings: {
		name: "devices",
		version: 1,
		namespace: "devices",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Device,
		
		modelPropFilter: "code type address name description status lastCommunication createdAt updatedAt"
	},
	
	actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {};

				let query = Device.find(filter);
				return ctx.queryPageSort(query).exec().then( (docs) => {
					return this.toJSON(docs);
				});
			}
		},

		// return a model by ID
		get: {
			cache: true,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:DeviceNotFound"));
				return Promise.resolve(ctx.model);
			}
		},

		create(ctx) {
			this.validateParams(ctx, true);
			
			let device = new Device({
				address: ctx.params.address,
				type: ctx.params.type,
				name: ctx.params.name,
				description: ctx.params.description,
				status: ctx.params.status
			});

			return device.save()
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "created", json);
				return json;
			});	
		},

		update(ctx) {
			ctx.assertModelIsExist(ctx.t("app:DeviceNotFound"));
			this.validateParams(ctx);

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {

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
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "updated", json);
				return json;
			});								
		},

		remove(ctx) {
			ctx.assertModelIsExist(ctx.t("app:DeviceNotFound"));

			return Device.remove({ _id: ctx.modelID })
			.then(() => {
				return ctx.model;
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "removed", json);
				return json;
			});		
		}

	},
	
	methods: {
		/**
		 * Validate params of context.
		 * We will call it in `create` and `update` actions
		 * 
		 * @param {Context} ctx 			context of request
		 * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
		 */
		validateParams(ctx, strictMode) {
			if (strictMode || ctx.hasParam("name"))
				ctx.validateParam("name").trim().notEmpty(ctx.t("app:DeviceNameCannotBeBlank")).end();

			if (strictMode || ctx.hasParam("status"))
				ctx.validateParam("status").isNumber();

			ctx.validateParam("description").trim().end();
			ctx.validateParam("address").trim().end();
			ctx.validateParam("type").trim().end();

			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}
	},	

	init(ctx) {
		// Fired when start the service
	},

	socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
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