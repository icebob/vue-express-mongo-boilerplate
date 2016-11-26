import Home from "./modules/home";
import Demo from "./modules/demo";
import Devices from "./modules/devices";
import Posts from "./modules/posts";
import Profile from "./modules/profile";

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

	"/profile": {
		component: Profile
	},	

	"*": {
		component: Home
	}
	
};