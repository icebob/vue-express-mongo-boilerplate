import Vue from "vue";
import { NAMESPACE, CHANGED_VALUE } from "./types";

export const getValue = function ({ dispatch }) {
	this.$service.emit("find").then( (data) => {
		console.log("Counter current value: ", data);
		dispatch(CHANGED_VALUE, data);
	});
};

export const increment = function ({ dispatch }) {
	this.$service.emit("increment").then((newValue) => {
		dispatch(CHANGED_VALUE, newValue);	
	});
};

export const decrement = function ({ dispatch }) {
	this.$service.emit("decrement").then((newValue) => {
		dispatch(CHANGED_VALUE, newValue);	
	});
};

export const changedValue = function ({ dispatch }, newValue) {
	dispatch(CHANGED_VALUE, newValue);
};
