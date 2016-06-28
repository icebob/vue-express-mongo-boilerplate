import Vue from "vue";
import { LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

export const selectDevice = ({ dispatch }, device, multiSelect) => {
	dispatch(SELECT, device, multiSelect);
}

export const clearSelection = ({ dispatch }) => {
	dispatch(CLEAR_SELECT);
}

export const downloadDevices = ({ dispatch }) => {
	Vue.http.get("/devices").then((response) => {
		let res = response.json();
		if (res.status == 200)
			dispatch(LOAD, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

}

export const addDevice = ({ dispatch }, device, needSelect) => {
	dispatch(ADD, device);
	if (needSelect)
		dispatch(SELECT, device, false);
}

export const updateDevice = ({ dispatch }, device) => {
	dispatch(UPDATE, device);
}

export const removeDevice = ({ dispatch }, device) => {
	dispatch(REMOVE, device);
}