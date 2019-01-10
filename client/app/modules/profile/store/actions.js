import Vue from "vue";
import toastr from "../../../core/toastr";

const NAMESPACE = "/api/profile";

import Service from "../../../core/service";
let service = new Service("profile"); 

export const getProfile = function ({ commit }) {
	service.rest("get").then((data) => {
		commit("UPDATE", data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};
