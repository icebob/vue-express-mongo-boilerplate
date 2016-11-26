import Vue from "vue";
import toastr from "../../../core/toastr";
import { NAMESPACE, SET } from "./types";

export const getProfile = function ({ dispatch }) {
	this.$service.rest("").then((data) => {
		dispatch(SET, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};
