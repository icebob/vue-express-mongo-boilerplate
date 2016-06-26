import Vue from "vue";
import types from "./types";

export const increment = ({ dispatch }) => {
	dispatch(types.INCREMENT);
}

export const getDevices = ({ dispatch }) => {
	Vue.http.get("/devices").then((response) => {
		dispatch(types.ADD_DEVICES, response.json());
	});

}