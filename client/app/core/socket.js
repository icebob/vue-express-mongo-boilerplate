import Vue from "vue";
import IO from "socket.io-client";
import { each, isFunction } from "lodash";

export default {

	install(Vue, connection, opts) {

		let socket;

		if (typeof connection === "object")
			socket = connection;
		else
			socket = IO(connection, opts);

		Vue.prototype.$socket = socket;

		Vue.mixin({

			beforeCompile() {
				if (this.$options.hasOwnProperty("socket")) {
					var conf = this.$options.socket;
					if (conf.events) {
						let prefix = conf.prefix || "";
						Object.keys(conf.events).forEach((key) => {
							let func = conf.events[key].bind(this);
							socket.on(prefix + key, func);
							conf.events[key].__binded = func;
						});
					}
				}
			},

			beforeDestroy() {
				if (this.$options.hasOwnProperty("socket")) {
					var conf = this.$options.socket;
					if (conf.events) {
						let prefix = conf.prefix || "";
						Object.keys(conf.events).forEach((key) => {
							socket.off(prefix + key, conf.events[key].__binded);
						});
					}
				}
			}

		});

	}

}