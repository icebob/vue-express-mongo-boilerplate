import Vue from "vue";
import toastr from "../../../core/toastr";
import { LOAD, ADD, UPDATE, UPVOTE, DOWNVOTE, REMOVE } from "./types";

const BASE_URL = "/posts";

export const downloadRows = ({ dispatch }, viewMode, sort) => {
	Vue.http.get(BASE_URL + "/" + viewMode + "/" + sort).then((response) => {
		let res = response.json();
		if (res.status == 200)
			dispatch(LOAD, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

};

export const saveRow = ({ dispatch }, model) => {
	Vue.http.post(BASE_URL, model).then((response) => {
		let res = response.data;

		// Websocket event will add this row
		//if (res.data)
		//	addRow({ dispatch }, res.data, true);
	});	
};

export const addRow = ({ dispatch }, row) => {
	dispatch(ADD, row);
};

export const rowAdded = ({ dispatch }, row) => {
	dispatch(ADD, row);
};

export const updateRow = ({ dispatch }, row) => {
	Vue.http.put(BASE_URL + "/" + row.code, row).then((response) => {
		let res = response.data;
		if (res.data)
			dispatch(UPDATE, res.data);
	});	
};

export const upVote = ({ dispatch }, row) => {
	Vue.http.get(BASE_URL + "/upvote/" + row.code, row).then((response) => {
		let res = response.data;
		if (res.data)
			dispatch(UPDATE, res.data);
		
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const downVote = ({ dispatch }, row) => {
	Vue.http.get(BASE_URL + "/downvote/" + row.code, row).then((response) => {
		let res = response.data;
		if (res.data)
			dispatch(UPDATE, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const rowChanged = ({ dispatch }, row) => {
	dispatch(UPDATE, row);
};

export const removeRow = ({ dispatch }, row) => {
	Vue.http.delete(BASE_URL + "/" + row.code).then((response) => {
		dispatch(REMOVE, row);
	});
};

export const rowRemoved = ({ dispatch }, row) => {
	dispatch(REMOVE, row);
};
