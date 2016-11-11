import Vue from "vue";
import toastr from "../../../core/toastr";
import { LOAD, ADD, UPDATE, UPVOTE, DOWNVOTE, REMOVE } from "./types";

const BASE_URL = "/posts";

export const downloadRows = ({ dispatch }, filter, sort) => {
	Vue.http.get(BASE_URL, { params: { filter, sort }}).then((response) => {
		let res = response.json();
		if (res.status == 200 && res.data)
			dispatch(LOAD, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

export const saveRow = ({ dispatch }, model) => {
	Vue.http.post(BASE_URL, model).then((response) => {
		let res = response.json();

		if (res.status == 200 && res.data)
			created({ dispatch }, res.data, true);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const created = ({ dispatch }, model) => {
	dispatch(ADD, model);
};

export const updateRow = ({ dispatch }, model) => {
	Vue.http.put(BASE_URL + "/" + model.code, model).then((response) => {
		let res = response.json();
		if (res.status == 200 && res.data)
			dispatch(UPDATE, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const updated = ({ dispatch }, model) => {
	dispatch(UPDATE, model);
};

export const removeRow = ({ dispatch }, model) => {
	Vue.http.delete(BASE_URL + "/" + model.code).then((response) => {
		dispatch(REMOVE, model);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const removed = ({ dispatch }, model) => {
	dispatch(REMOVE, model);
};


export const upVote = ({ dispatch }, model) => {
	Vue.http.get(BASE_URL + "/upvote", { params: { code: model.code }}).then((response) => {
		let res = response.json();
		if (res.status == 200 && res.data)
			dispatch(UPDATE, res.data);
		
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const downVote = ({ dispatch }, model) => {
	Vue.http.get(BASE_URL + "/downvote", { params: { code: model.code }}).then((response) => {
		let res = response.json();
		if (res.status == 200 && res.data)
			dispatch(UPDATE, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};