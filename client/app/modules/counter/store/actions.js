import Vue from "vue";

import Service from "../../../core/service";

let service = new Service("counter", this); 

export const getValue = function (ctx) {
	service.emit("find").then( (data) => {
		console.log("Counter current value: ", data);
		ctx.commit("CHANGED_VALUE", data);
	});
};

export const increment = function ({ commit }) {
	service.emit("increment").then((newValue) => {
		commit("CHANGED_VALUE", newValue);	
	});
};

export const decrement = function ({ commit }) {
	service.emit("decrement").then((newValue) => {
		commit("CHANGED_VALUE", newValue);	
	});
};

export const changedValue = function ({ commit }, newValue) {
	commit("CHANGED_VALUE", newValue);
};
