import Vue from "vue";
import io from "socket.io-client";

let socket = io();
Vue.prototype.$socket = socket;

socket.on("connect", () => {
	console.log("WS connected!", socket);

});

module.exports = socket;
