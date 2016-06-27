import Vue from "vue";
import { INCREMENT, ADD_DEVICES, SELECT_DEVICE } from "./mutation-types";

export const increment = ({ dispatch }) => {
	dispatch(INCREMENT);
}

export const selectDevice = ({ dispatch }, device) => {
	dispatch(SELECT_DEVICE, device);
}

export const getDevices = ({ dispatch }) => {
	Vue.http.get("/devices").then((response) => {
		let res = response.json();
		if (res.status == 200)
			dispatch(ADD_DEVICES, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

}