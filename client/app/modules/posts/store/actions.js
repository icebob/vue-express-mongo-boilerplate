import Vue from "vue";
import toastr from "../../../core/toastr";
import Service from "../../../core/service";
import { LOAD, LOAD_MORE, ADD, UPDATE, VOTE, UNVOTE, REMOVE, 
	NO_MORE_ITEMS, FETCHING, CHANGE_SORT, CHANGE_VIEWMODE } from "./types";

export const NAMESPACE	 	= "/api/posts";

let service = new Service("posts"); 

export const getRows = function ({commit, state}, loadMore) {
	commit(FETCHING, true);
	return service.rest("find", { filter: state.viewMode, sort: state.sort, limit: 10, offset: state.offset }).then((data) => {
		if (data.length == 0)
			commit(NO_MORE_ITEMS);
		else
			commit(loadMore ? LOAD_MORE : LOAD, data);
	}).catch((err) => {
		toastr.error(err.message);
	}).then(() => {
		commit(FETCHING, false);		
	});
};

export const loadMoreRows = function(context) {
	return getRows(context, true);
};

export const changeSort = function(store, sort) {
	store.commit(CHANGE_SORT, sort);
	getRows(store);
};

export const changeViewMode = function(store, viewMode) {
	store.commit(CHANGE_VIEWMODE, viewMode);
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

export const created = function({ commit }, model) {
	commit(ADD, model);
};

export const updated = function({ commit }, model) {
	commit(UPDATE, model);
};

export const removed = function({ commit }, model) {
	commit(REMOVE, model);
};
