import Vue from "vue";
import IO from "socket.io-client";
import { each } from "lodash";

export default function createIOMixin(connection, opts) {
	let socket;

	if (typeof connection === 'object')
		socket = connection;
	else
		socket = IO(connection, opts);

	socket.on("connect", () => {
		console.log("Websocket connected to " + socket.nsp);
	});

	return {

		created() {
			if (this.$options.hasOwnProperty("sockets")) {
				each(this.$options.sockets, (func, key) => {
					socket.on(key, (payload) => {
						func.call(this, payload);
					});
				});
			}

			this.$socket = socket;
		},

		destroyed() {
			if (this.$socket)
				this.$socket.disconnect();
		}

	}
}