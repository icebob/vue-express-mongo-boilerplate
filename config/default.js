"use strict";

let path = require('path');
let pkg = require("../package.json");

let rootPath = path.normalize(path.join(__dirname, ".."));

module.exports = {
  app: {
    title: pkg.name,
    version: pkg.version,
    description: pkg.description,
    keywords: pkg.keywords.join(","),
    url: 'http://localhost:3000/',
  },

  ip: '0.0.0.0',
  port: process.env.PORT || 3000,
  rootPath: rootPath,
  dataFolder: path.join(rootPath, "data"),
  contentMaxLength: 2 * 1024 * 1024, // 2MB

  test: false,

  db: {
  	uri: process.env.MONGO_URI || "mongodb://localhost/" + pkg.config.dbName + "-dev",
    options: {
      user: '',
      pass: '',
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    }

  }
};