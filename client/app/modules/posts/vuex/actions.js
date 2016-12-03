import Vue from "vue";
import toastr from "../../../core/toastr";
import Service from "../../../core/service";
import { NAMESPACE, LOAD, LOAD_MORE, ADD, UPDATE, VOTE, UNVOTE, REMOVE, 
	NO_MORE_ITEMS, FETCHING, CHANGE_SORT, CHANGE_VIEWMODE } from "./types";

let service = new Service("posts"); 

export const getRows = function (store, loadMore) {
	let state = store.state.posts;
	store.dispatch(FETCHING, true);
	return service.rest("find", { filter: state.viewMode, sort: state.sort, limit: 10, offset: state.offset }).then((data) => {
		if (data.length == 0)
			store.dispatch(NO_MORE_ITEMS);
		else
			store.dispatch(loadMore ? LOAD_MORE : LOAD, data);
	}).catch((err) => {
		toastr.error(err.message);
	}).then(() => {
		store.dispatch(FETCHING, false);		
	});
};

export const changeSort = function(store, sort) {
	store.dispatch(CHANGE_SORT, sort);
	getRows(store);
};

export const changeViewMode = function(store, viewMode) {
	store.dispatch(CHANGE_VIEWMODE, viewMode);
	getRows(store);
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
	service.rest("remove", { code: model.code }).then((data) => {
		removed(store, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const vote = function(store, model) {
	service.rest("vote", { code: model.code }).then((data) => {
		updated(store, data);
	}).catch((err) => {
		toastr.error(err.message);
	});
};

export const unVote = function(store, model) {
	service.rest("unvote", { code: model.code }).then((data) => {
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
