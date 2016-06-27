"use strict";

import style from "../scss/style.scss";
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import Filters from './core/filters';

import App from './core/App';

Vue.use(Filters);

Vue.use(VueRouter);
Vue.use(VueResource);

//Vue.http.headers.common['X-CSRF-TOKEN'] = $('input[name="csrf"]').val();
Vue.http.headers.common['Accept'] = "application/json";

Vue.config.debug = true;

let router = require('./core/router')();

router.start(App, "#app");
