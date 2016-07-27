"use strict";

let ROOT 			= "../../";
let logger 			= require(ROOT + "core/logger");
let config 			= require(ROOT + "config");

let _ 				= require("lodash");
let tokgen 			= require(ROOT + "libs/tokgen");
let fakerator		= require("fakerator")();

let Device 			= require("../modules/devices/model.device");

module.exports = function() {
	Device.find({}).exec(function(err, docs) {
		if (docs.length === 0) {
			logger.warn("Load default Devices to DB...");

			_.times(5, () => {

				let device = new Device({
					address: fakerator.internet.ip(),
					type: fakerator.random.arrayElement(["rasperry", "odroid", "nanopi", "pc"]),
					name: fakerator.populate("#{names.firstName}'s device"),
					description: fakerator.lorem.sentence(),
					status: fakerator.random.boolean("80") ? 1 : 0,
					lastCommunication: Date.now()
				});

				device.save(function(err) {
					if (err) 
						return logger.warn("Unable to create default devices!", err);
				});
			});
		}
	});

};
