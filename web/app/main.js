"use strict";

import style from "../scss/style.scss";
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';

import App from './core/App';

Vue.use(VueRouter);
Vue.use(VueResource);

Vue.config.debug = true;

let router = require('./core/router')();

router.start(App, "#app");
