import Home from "./modules/home";
import Devices from "./modules/devices";
import Posts from "./modules/posts";

module.exports = {

	"/devices": {
		component: Devices
	},

	"/posts": {
		component: Posts
	},

	"*": {
		component: Home
	}
	
};