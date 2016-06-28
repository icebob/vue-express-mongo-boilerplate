import Home from "./modules/home";
import Devices from "./modules/devices";

module.exports = {

	'/devices': {
		component: Devices
	},

	'*': {
		component: Home
	}
	
};