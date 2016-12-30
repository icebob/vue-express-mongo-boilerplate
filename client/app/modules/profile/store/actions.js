import Vue from "vue";
import toastr from "../../../core/toastr";
import { NAMESPACE, SET } from "./types";

import Service from "../../../core/service";
let service = new Service("profile"); 

export const getProfile = function ({ commit }) {
	service.rest("get").then((data) => {
		commit(SET, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};
