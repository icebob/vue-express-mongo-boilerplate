import { ADD_MESSAGE, ADD_NOTIFICATION, SET_USER } from "./types";

// import { each, find, assign, remove, isArray } from "lodash";

const state = {
	user: null,
	notifications: [
		{ id: 1, text: "Something happened!", time: 1, user: null }
	],
	messages: []
};

const mutations = {
	[ADD_MESSAGE] (state, item) {
		state.messages.splice(0);
		state.messages.push(item);
	},

	[ADD_NOTIFICATION] (state, item) {
		state.notifications.splice(0);
		state.notifications.push(item);
	},

	[SET_USER] (state, user) {
		state.user = user;
	}	

};


export default {
	state,
	mutations
};