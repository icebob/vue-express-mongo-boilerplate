import Home from "./modules/home";
import Counter from "./modules/counter";
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

	"/counter": {
		component: Counter
	},	

	"/profile": {
		component: Profile
	},	

	"*": {
		component: Home
	}
	
};