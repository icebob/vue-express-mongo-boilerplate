import Vue from "vue";
import toastr from "../../../core/toastr";
import Service from "../../../core/service";
import { NAMESPACE, LOAD, ADD, UPDATE, UPVOTE, DOWNVOTE, REMOVE } from "./types";

let rest = new Service("posts").getRESTInterface(); 

export const downloadRows = function ({ dispatch }, filter, sort) {
	rest.invoke("find", { filter, sort }).then((data) => {
		dispatch(LOAD, data);
	});
};

export const saveRow = function({ dispatch }, model) {
	rest.invoke("save", model).then((data) => {
		dispatch(ADD, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const created = function({ dispatch }, model) {
	dispatch(ADD, model);
};

export const updateRow = function({ dispatch }, model) {
	rest.invoke("update", model).then((data) => {
		dispatch(UPDATE, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const updated = function({ dispatch }, model) {
	dispatch(UPDATE, model);
};

export const removeRow = function({ dispatch }, model) {
	rest.invoke("remove", model).then((data) => {
		dispatch(REMOVE, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const removed = function({ dispatch }, model) {
	dispatch(REMOVE, model);
};


export const upVote = function({ dispatch }, model) {
	rest.invoke("upVote", { code: model.code }).then((data) => {
		dispatch(UPDATE, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const downVote = function({ dispatch }, model) {
	rest.invoke("downVote", { code: model.code }).then((data) => {
		dispatch(UPDATE, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};