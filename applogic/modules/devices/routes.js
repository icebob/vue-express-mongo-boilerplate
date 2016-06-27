"use strict";

let logger 			= require('../../../core/logger');
let config 			= require("../../../config");

let express			= require("express");

let auth			= require("../../../core/auth/helper");
let Device 			= require("../../../models/devices");
let hashids			= require("../../../libs/hashids");
let response		= require("../../../libs/response");

module.exports = function(app, db) {

	let router = express.Router();

	//router.use(auth.isAuthenticated);

	// Get device list
	router.route('/')
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
		
		// Save new device
		.post((req, res) => {

			req.assert('name', 'Device name cannot be blank!').notEmpty();

			let errors = req.validationErrors();
			if (errors)
				return response.json(res, null, response.BAD_REQUEST, errors);
		

			let device = new Device({
				address: req.body.address,
				type: req.body.type,
				name: req.body.name,
				description: req.body.description,
			});

			device.save((err) => {
				if (err)
					return response.json(res, null, response.SERVER_ERROR, err);

				return response.json(res, device.toJSON());
			});
		});

	// Resolve deviceID and device
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
	})

	router.route("/:deviceID")

		.all((req, res, next) => {

			next();
		})

		// Get device
		.get((req, res) => {
			return response.json(res, req.device.toJSON());
		})

		// Modify device
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

				return response.json(res, req.device.toJSON());
			});
		})

		// Delete device
		.delete((req, res) => {
			Device.remove({ _id: req.device.id }, (err) => {
				if (err)
					return response.json(res, null, response.BAD_REQUEST, err);

				return response.json(res);
			});

		});


	// API versioning
	app.use("/v1/devices", router);

	// v1 is the default route
	app.use("/devices", router);
};