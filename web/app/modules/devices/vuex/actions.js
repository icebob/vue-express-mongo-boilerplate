import Vue from "vue";
import { LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

export const selectRow = ({ dispatch }, row, multiSelect) => {
	dispatch(SELECT, row, multiSelect);
}

export const clearSelection = ({ dispatch }) => {
	dispatch(CLEAR_SELECT);
}

export const downloadRows = ({ dispatch }) => {
	Vue.http.get("/devices").then((response) => {
		let res = response.json();
		if (res.status == 200)
			dispatch(LOAD, res.data);
		else
			console.error("Request error!", res.error);

	}).catch((response) => {
		console.error("Request error!", response.statusText);
	});

}

export const addRow = ({ dispatch }, row, needSelect) => {
	dispatch(ADD, row);
	if (needSelect)
		dispatch(SELECT, row, false);
}

export const updateRow = ({ dispatch }, row) => {
	dispatch(UPDATE, row);
}

export const removeRow = ({ dispatch }, row) => {
	dispatch(REMOVE, row);
}