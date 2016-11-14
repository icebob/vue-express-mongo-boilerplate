import Vue from "vue";
import { NAMESPACE, CHANGED_VALUE } from "./types";

export const increment = function ({ dispatch }, vm) {
	vm.$socket.emit(NAMESPACE + "/increment");
};

export const decrement = function ({ dispatch }, vm) {
	vm.$socket.emit(NAMESPACE + "/decrement");
};

export const changedValue = function ({ dispatch }, newValue) {
	dispatch(CHANGED_VALUE, newValue);
};
