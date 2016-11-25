"use strict";

require("es6-promise").polyfill();

import style from "../scss/style.scss";
import Vue from "vue";
import VueRouter from "vue-router";
import VueResource from "vue-resource";
import VueAnimatedList from "vue-animated-list";
import Filters from "./core/filters";
import VueI18Next from "./core/i18next.js";
import VueFormGenerator from "vue-form-generator";
import VueWebsocket from "vue-websocket";

import App from "./core/App";

Vue.use(Filters);

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(VueAnimatedList);
Vue.use(VueFormGenerator);
Vue.use(VueWebsocket);

//Vue.http.headers.common['X-CSRF-TOKEN'] = $('input[name="csrf"]').val();
Vue.http.headers.common["Accept"] = "application/json";

Vue.config.debug = true;


// Register i18next localization module. We need to 
// wait it before start the application!
Vue.use(VueI18Next, (i18next) => {

	let router = require("./core/router")();

	router.start(App, "#app");

});
