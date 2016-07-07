"use strict";

let logger 			= require("../../../core/logger");
let config 			= require("../../../config");

let express			= require("express");

let auth			= require("../../../core/auth/helper");
let response		= require("../../../core/response");
let Device 			= require("./model.device");
let hashids			= require("../../../libs/hashids");

let io 				= require("../../../core/socket");

let namespace = "/devices";

module.exports = function(app, db) {

	let router = express.Router();

	// Must be authenticated
	router.use(auth.isAuthenticatedOrApiKey);

	// Must be admin role
	//router.use(auth.hasRole("admin"));

	router.route("/")
		
		/**
		 * Get all devices
		 */
		.get((req, res) => {
		
			Device.find({}).exec((err, docs) => {

				// Sample for multiple response by accept header
				return res.format({
					// html() { res.render("devices", { devices: items })}
					json() {
						if (docs.length == 0) return response.json(res, []);

						let items = docs.map((item) => item.toJSON());

						return response.json(res, items);
					}
				});

			});
		})
		
		/**
		 * Save a new device
		 */
		.post((req, res) => {

			req.assert("name", "Device name cannot be blank!").notEmpty();

			let errors = req.validationErrors();
			if (errors)
				return response.json(res, null, response.BAD_REQUEST, errors);
		

			let device = new Device({
				address: req.body.address,
				type: req.body.type,
				name: req.body.name,
				description: req.body.description,
				status: req.body.status
			});

			device.save((err) => {
				if (err)
					return response.json(res, null, response.SERVER_ERROR, err);

				let json = device.toJSON();

				if (io.namespaces[namespace])
					io.namespaces[namespace].emit("new", json);

				return response.json(res, json);
			});
		});

	/**
	 * Resolve the deviceID URL parameter. First decode the hashed ID 
	 * and search device by ID in database
	 */
	router.param("deviceID", function(req, res, next, deviceID) {
		let id = hashids.decodeHex(deviceID);
		if (id == null || id == "")
			return response.json(res, null, response.BAD_REQUEST, "Invalid Device ID!");

		Device.findById(id, (err, doc) => {
			if (err)
				return response.json(res, null, response.BAD_REQUEST, err);
			
			if (!doc) 
				return response.json(res, null, response.NOT_FOUND, "Device not found!");

			req.device = doc;
			next();
		});
	});

	/**
	 * Handle deviceID specific routes
	 */
	router.route("/:deviceID")

		// Call every request method
		.all((req, res, next) => {

			next();
		})

		/**
		 * Get a device
		 */
		.get((req, res) => {
			return response.json(res, req.device.toJSON());
		})

		/**
		 * Modify a device
		 */
		.put((req, res) => {
			if (req.body.address != null)
				req.device.address = req.body.address;

			if (req.body.type != null)
				req.device.type = req.body.type;

			if (req.body.name != null)
				req.device.name = req.body.name;

			if (req.body.description != null)
				req.device.description = req.body.description;

			if (req.body.status != null)
				req.device.status = req.body.status;

			req.device.save((err) => {
				if (err)
					return response.json(res, null, response.BAD_REQUEST, err);

				let json = req.device.toJSON();

				if (io.namespaces[namespace])
					io.namespaces[namespace].emit("update", json);

				return response.json(res, json);
			});
		})

		/**
		 * Delete a device
		 */
		.delete((req, res) => {
			Device.remove({ _id: req.device.id }, (err) => {
				if (err)
					return response.json(res, null, response.BAD_REQUEST, err);

				if (io.namespaces[namespace])
					io.namespaces[namespace].emit("remove", req.device.toJSON());

				return response.json(res);
			});

		});


	// API versioning
	app.use("/v1/devices", router);

	// v1 is the default route
	app.use("/devices", router);
};