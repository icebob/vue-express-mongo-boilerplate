"use strict";

let logger 			= require('../../../core/logger');
let config 			= require("../../../config");

let express			= require("express");

let auth			= require("../../../core/auth/helper");
let Device 			= require("../../../models/devices");

module.exports = function(app, db) {

	let router = express.Router();

	//router.use(auth.isAuthenticated);

	// Get device list
	router.route('/')
		.get((req, res) => {
		
			Device.find({}).exec((err, docs) => {

				if (docs.length == 0) return res.json([]);

				let items = docs.map((item) => item.toJSON());

				return res.format({
					// html() { res.render("devices", { devices: items })}
					json() {
						res.json(items);
					}
				});

			});
		})
		
		// Save new device
		.post((req, res) => {

			req.assert('name', 'Device name cannot be blank!').notEmpty();

			let errors = req.validationErrors();
			if (errors) {
				return res.json({
					error: errors
				});
			}

			let device = new Device({
				address: req.body.address,
				type: req.body.type,
				name: req.body.name,
				description: req.body.description,
			});

			device.save((err) => {
				if (err)
					return res.json({
						error: err
					});

				return res.json({
					result: device.toJSON()
				});
			});
		})

	app.use("/devices", router);
};