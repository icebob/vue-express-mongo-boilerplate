import Vue from "vue";
import { NAMESPACE, CHANGED_VALUE } from "./types";

export const getValue = function ({ commit }) {
	this.$service.emit("find").then( (data) => {
		console.log("Counter current value: ", data);
		commit(CHANGED_VALUE, data);
	});
};

export const increment = function ({ commit }) {
	this.$service.emit("increment").then((newValue) => {
		commit(CHANGED_VALUE, newValue);	
	});
};

export const decrement = function ({ commit }) {
	this.$service.emit("decrement").then((newValue) => {
		commit(CHANGED_VALUE, newValue);	
	});
};

export const changedValue = function ({ commit }, newValue) {
	commit(CHANGED_VALUE, newValue);
};
