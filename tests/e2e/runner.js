"use strict";

let path = require("path");

// 1. start the server
process.env.NODE_ENV = "test";

// Pass the port of server via environment
let app = require("../load-server");
process.env.APP_PORT = parseInt(app._app.settings.port);

// 2. run the nightwatch test suite against it
// to run in additional browsers:
//    1. add an entry in tests/e2e/nightwatch.conf.json under "test_settings"
//    2. or add it to the --env flag below
// or override the environment flag, for example: `npm run e2e -- --env chrome,firefox`
// For more information on Nightwatch's config file, see
// http://nightwatchjs.org/guide#settings-file

let opts = process.argv.slice(2);
if (opts.indexOf("--config") === -1) {
	opts = opts.concat(["--config", "tests/e2e/nightwatch.conf.js"]);
}
if (opts.indexOf("--env") === -1) {
	opts = opts.concat(["--env", "chrome"]);
}

// Clear reports folder
let del = require("del");
del.sync(path.join(__dirname, "reports", "**"));

let spawn = require("cross-spawn");
let runner = spawn("./node_modules/.bin/nightwatch", opts, { stdio: "inherit" });

runner.on("exit", function (code) {
	app.close();
	process.exit(code);
});

runner.on("error", function (err) {
	app.close();
	throw err;
});
