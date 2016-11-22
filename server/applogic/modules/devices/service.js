"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let Device 		= require("./models/device");

module.exports = {
	name: "devices",
	version: 1,
	namespace: "devices",
	rest: true,
	ws: true,
	permission: C.PERM_LOGGEDIN,
	model: Device,
	
	modelPropFilter: "code type address name description status lastCommunication createdAt updatedAt",
	
	actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {};

				let query = Device.find(filter);
				return ctx.queryPageSort(query).exec().then( (docs) => {
					return ctx.toJSON(docs);
				});
			}
		},

		// return a model by ID
		get: {
			handler(ctx) {
				if (!ctx.model)
					throw ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:DeviceNotFound"));

				return Device.findByIdAndUpdate(ctx.model.id).exec().then( (doc) => {
					return ctx.toJSON(doc);
				});
			}
		},

		create: {
			handler(ctx) {
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
						return Device.populate(doc, { path: "author", select: this.populateAuthorFields});
					})
					.then((doc) => {
						return ctx.toJSON(doc);
					})
					.then((json) => {
						this.notifyModelChanges(ctx, "created", json);

						return json;
					});								
			}
		},

		update: {
			handler(ctx) {
				if (!ctx.model)
					throw ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:DeviceNotFound"));

				this.validateParams(ctx);

				if (ctx.params.address != null)
					ctx.model.address = ctx.params.address;

				if (ctx.params.type != null)
					ctx.model.type = ctx.params.type;

				if (ctx.params.name != null)
					ctx.model.name = ctx.params.name;

				if (ctx.params.description != null)
					ctx.model.description = ctx.params.description;

				if (ctx.params.status != null)
					ctx.model.status = ctx.params.status;

				return ctx.model.save()
					.then((doc) => {
						return ctx.toJSON(doc);
					})
					.then((json) => {

						this.notifyModelChanges(ctx, "updated", json);

						return json;
					});								
			}
		},

		remove: {
			handler(ctx) {
				if (!ctx.model)
					throw ctx.errorBadRequest(C.ERR_MODEL_NOT_FOUND, ctx.t("app:DeviceNotFound"));

				return Device.remove({ _id: ctx.model.id })
					.then(() => {
						return ctx.toJSON();
					})
					.then((json) => {

						this.notifyModelChanges(ctx, "removed", json);

						return json;
					});		
			}
		}

	},
	
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
	},	

	// resolve model by ID		
	modelResolver(ctx, code) {
		let id = Device.schema.methods.decodeID(code);
		if (id == null || id == "")
			return ctx.errorBadRequest(C.ERR_INVALID_CODE, ctx.t("app:InvalidCode"));

		return Device.findById(id).exec();
	},

	notifyModelChanges(ctx, type, json) {
		ctx.notifyChanges(type, json, "user");
		this.clearCache();
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