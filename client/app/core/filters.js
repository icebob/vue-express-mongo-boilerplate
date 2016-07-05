import _ from "lodash";
import Vue from "vue";
import moment from "moment";
//import prettyBytes from 'pretty-bytes';

let filters = {
	prettyJSON(json) {
		if (json) {
			json = JSON.stringify(json, undefined, 4);
			json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
				let cls = "number";
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = "key";
					} else {
						cls = "string";
					}
				} else if (/true|false/.test(match)) {
					cls = "boolean";
				} else if (/null/.test(match)) {
					cls = "null";
				}
				return "<span class=\"" + cls + "\">" + match + "</span>";
			});
		}
	},

	/*bytes(bytes) {
		return prettyBytes(bytes);
	},*/

	ago(time) {
		return moment(time).fromNow();
	}

};

module.exports = {
	filters,

	install(Vue) {
		_.each(filters, (func, name) => Vue.filter(name, func));
	}
};
