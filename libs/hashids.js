"use strict";

let Hashids = require("hashids");
let secrets = require("../core/secrets");

module.exports = new Hashids(secrets.hashSecret, 10);
