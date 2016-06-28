import Vue from "vue";
import { INCREMENT, DECREMENT, CHANGE_VALUE } from "./types";

export const increment = ({ dispatch }) => {
	dispatch(INCREMENT);
}

export const decrement = ({ dispatch }) => {
	dispatch(DECREMENT);
}

export const changeValue = ({ dispatch }, newValue) => {
	dispatch(CHANGE_VALUE, newValue);
}
