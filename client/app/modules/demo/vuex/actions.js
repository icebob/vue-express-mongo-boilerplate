import Vue from "vue";
import { NAMESPACE, CHANGED_VALUE } from "./types";

export const getValue = function ({ dispatch }) {
	this.$socket.emit(NAMESPACE + "/find", null, (value) => {
		console.log("Counter current value: ", value);
		dispatch(CHANGED_VALUE, value.data);
	});
};

export const increment = function ({ dispatch }) {
	this.$socket.emit(NAMESPACE + "/increment");
};

export const decrement = function ({ dispatch }) {
	this.$socket.emit(NAMESPACE + "/decrement");
};

export const changedValue = function ({ dispatch }, newValue) {
	dispatch(CHANGED_VALUE, newValue);
};
