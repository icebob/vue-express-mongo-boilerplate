import Vue from "vue";
import toastr from "../../../core/toastr";
import { NAMESPACE, LOAD, ADD, SELECT, CLEAR_SELECT, UPDATE, REMOVE } from "./types";

export const selectRow = ({ dispatch }, row, multiSelect) => {
	dispatch(SELECT, row, multiSelect);
};

export const clearSelection = ({ dispatch }) => {
	dispatch(CLEAR_SELECT);
};

export const downloadRows = ({ dispatch }) => {
	Vue.http.get(NAMESPACE).then((response) => {
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
	Vue.http.post(NAMESPACE, model).then((response) => {
		let res = response.data;

		if (res.status == 200 && res.data)
			created({ dispatch }, res.data, true);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});		
};

export const created = ({ dispatch }, row, needSelect) => {
	dispatch(ADD, row);
	if (needSelect)
		dispatch(SELECT, row, false);
};

export const updateRow = ({ dispatch }, row) => {
	Vue.http.put(NAMESPACE + "/" + row.code, row).then((response) => {
		let res = response.data;
		if (res.data)
			dispatch(UPDATE, res.data);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});	
};

export const updated = ({ dispatch }, row) => {
	dispatch(UPDATE, row);
};

export const removeRow = ({ dispatch }, row) => {
	Vue.http.delete(NAMESPACE + "/" + row.code).then((response) => {
		dispatch(REMOVE, row);
	}).catch((response) => {
		if (response.data.error)
			toastr.error(response.data.error.message);
	});
};

export const removed = ({ dispatch }, row) => {
	dispatch(REMOVE, row);
};
