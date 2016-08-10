import Vue from "vue";
import { ADD_MESSAGE, ADD_NOTIFICATION, SET_USER } from "./types";

const BASE_URL = "/session";

export const getSessionUser = ({ dispatch }) => {
	Vue.http.get(BASE_URL + "/me").then((response) => {
		let res = response.json();
		if (res.status == 200)
			dispatch(SET_USER, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});
};

export const addMessage = ({ dispatch }, item) => {
	dispatch(ADD_MESSAGE, item);
};

export const addNotification = ({ dispatch }, item) => {
	dispatch(ADD_NOTIFICATION, item);
};
