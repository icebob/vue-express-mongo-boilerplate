import Vue from "vue";
import toastr from "../../../core/toastr";
import { NAMESPACE, SET } from "./types";

export const getProfile = function ({ commit }) {
	this.$service.rest("get").then((data) => {
		commit(SET, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};
