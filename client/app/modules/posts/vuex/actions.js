import Vue from "vue";
import toastr from "../../../core/toastr";
import { NAMESPACE, LOAD, ADD, UPDATE, UPVOTE, DOWNVOTE, REMOVE } from "./types";

export const downloadRows = function ({ dispatch }, filter, sort) {
	this.$http.get(NAMESPACE, { params: { filter, sort }}).then((response) => {
		let res = response.json();
		if (res.status == 200 && res.data)
			dispatch(LOAD, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

export const saveRow = function({ dispatch }, model) {
	this.$http.post(NAMESPACE, model).then((response) => {
		let res = response.json();

		if (res.status == 200 && res.data)
			created({ dispatch }, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const created = function({ dispatch }, model) {
	dispatch(ADD, model);
};

export const updateRow = function({ dispatch }, model) {
	this.$http.put(NAMESPACE + "/" + model.code, model).then((response) => {
		let res = response.json();
		if (res.status == 200 && res.data)
			dispatch(UPDATE, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const updated = function({ dispatch }, model) {
	dispatch(UPDATE, model);
};

export const removeRow = function({ dispatch }, model) {
	this.$http.delete(NAMESPACE + "/" + model.code).then((response) => {
		dispatch(REMOVE, model);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const removed = function({ dispatch }, model) {
	dispatch(REMOVE, model);
};


export const upVote = function({ dispatch }, model) {
	this.$http.get(NAMESPACE + "/upvote", { params: { code: model.code }}).then((response) => {
		let res = response.json();
		if (res.status == 200 && res.data)
			dispatch(UPDATE, res.data);
		
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const downVote = function({ dispatch }, model) {
	this.$http.get(NAMESPACE + "/downvote", { params: { code: model.code }}).then((response) => {
		let res = response.json();
		if (res.status == 200 && res.data)
			dispatch(UPDATE, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};