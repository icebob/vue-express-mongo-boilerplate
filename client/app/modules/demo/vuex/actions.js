import Vue from "vue";
import { NAMESPACE, CHANGED_VALUE } from "./types";

export const increment = ({ dispatch }, vm) => {
	vm.$socket.emit(NAMESPACE + "/increment");
};

export const decrement = ({ dispatch }, vm) => {
	vm.$socket.emit(NAMESPACE + "/decrement");
};

export const changedValue = ({ dispatch }, newValue) => {
	dispatch(CHANGED_VALUE, newValue);
};
