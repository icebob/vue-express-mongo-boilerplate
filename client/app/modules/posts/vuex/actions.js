import Vue from "vue";
import toastr from "../../../core/toastr";
import Service from "../../../core/service";
import { NAMESPACE, LOAD, ADD, UPDATE, UPVOTE, DOWNVOTE, REMOVE } from "./types";

let service = new Service("posts"); 

export const downloadRows = function ({ dispatch }, filter, sort) {
	service.rest("find", { filter, sort }).then((data) => {
		dispatch(LOAD, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const saveRow = function(store, model) {
	service.rest("create", model).then((data) => {
		created(store, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const updateRow = function(store, model) {
	service.rest("update", model).then((data) => {
		updated(store, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const removeRow = function(store, model) {
	service.rest("remove", model).then((data) => {
		removed(store, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const upVote = function(store, model) {
	service.rest("upVote", { code: model.code }).then((data) => {
		updated(store, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const downVote = function(store, model) {
	service.rest("downVote", { code: model.code }).then((data) => {
		updated(store, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const created = function({ dispatch }, model) {
	dispatch(ADD, model);
};

export const updated = function({ dispatch }, model) {
	dispatch(UPDATE, model);
};

export const removed = function({ dispatch }, model) {
	dispatch(REMOVE, model);
};
