import Vue from "vue";
import { INCREMENT, ADD_DEVICES } from "./mutation-types";

export const increment = ({ dispatch }) => {
	dispatch(INCREMENT);
}

export const getDevices = ({ dispatch }) => {
	Vue.http.get("/devices").then((response) => {
		dispatch(ADD_DEVICES, response.json());
	});

}