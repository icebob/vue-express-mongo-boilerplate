"use strict";

import style from "../scss/style.scss";
import Vue from 'vue';
import App from './App';

console.log("App started!");


new Vue({
  el: 'body',
  components: { App }
})

var socket = io();
socket.on("connect", function() {
	console.log("WS connected!", socket);

	socket.emit("welcome", "Hi I'm here!");
});
window.socket = socket;