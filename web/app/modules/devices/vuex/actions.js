import Vue from "vue";
import { LOAD_DEVICES, ADD_DEVICE, SELECT_DEVICE, UPDATE_DEVICE, REMOVE_DEVICE } from "../../../vuex/mutation-types";

export const selectDevice = ({ dispatch }, device) => {
	dispatch(SELECT_DEVICE, device);
}

export const downloadDevices = ({ dispatch }) => {
	Vue.http.get("/devices").then((response) => {
		let res = response.json();
		if (res.status == 200)
			dispatch(LOAD_DEVICES, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

}

export const addDevice = ({ dispatch }, device) => {
	dispatch(ADD_DEVICE, device);
}

export const updateDevice = ({ dispatch }, device) => {
	dispatch(UPDATE_DEVICE, device);
}

export const removeDevice = ({ dispatch }, device) => {
	dispatch(REMOVE_DEVICE, device);
}