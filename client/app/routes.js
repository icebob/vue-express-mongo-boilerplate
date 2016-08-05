import Home from "./modules/home";
import Demo from "./modules/demo";
import Devices from "./modules/devices";
import Posts from "./modules/posts";

module.exports = {

	"/devices": {
		component: Devices
	},

	"/posts": {
		component: Posts
	},

	"/demo": {
		component: Demo
	},	

	"*": {
		component: Home
	}
	
};