import Vue from "vue";
import { NAMESPACE, ADD_MESSAGE, ADD_NOTIFICATION, SET_USER, SEARCH } from "./types";

export const getSessionUser = ({ dispatch }) => {
	Vue.http.get(NAMESPACE + "/me").then((response) => {
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

export const searching = ({ dispatch }, text) => {
	dispatch(SEARCH, text);
};
