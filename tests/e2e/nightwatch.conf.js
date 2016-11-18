"use strict";

let seleniumServer = require("selenium-server");
let chromedriver = require("chromedriver");

let appPort = process.env.APP_PORT || process.env.PORT || 4000;

// http://nightwatchjs.org/guide#settings-file
// 
module.exports = {
	"src_folders": ["tests/e2e/specs"],
	"output_folder": "tests/e2e/reports",
	"globals_path": "tests/e2e/globals.js",
	"custom_assertions_path": ["tests/e2e/custom-assertions"],
	"custom_commands_path": [ "tests/e2e/custom-commands" ],
	"page_objects_path": "tests/e2e/pages",
	"test_runner": {
		"type" : "mocha",
		"options": {
			"ui": "bdd",
			"reporter": "spec"
		}
	},

	"selenium": {
		"start_process": true,
		"server_path": seleniumServer.path,
		"host": "127.0.0.1",
		"port": 4444,
		"cli_args": {
			"webdriver.chrome.driver": chromedriver.path
		}
	},

	"test_settings": {
		"default": {
			"appPort": appPort,
			"selenium_port": 4444,
			"selenium_host": "localhost",
			"silent": true,
			"desiredCapabilities": {
				"javascriptEnabled": true,
				"acceptSslCerts": true
			},
			"screenshots": {
				"enabled": true,
				"on_failure" : true,
				"on_error" : false,
				"path": "tests/e2e/reports/screenshots"
			}
		},

		"chrome": {
			"desiredCapabilities": {
				"browserName": "chrome",				
			}
		},

		"firefox": {
			"desiredCapabilities": {
				"browserName": "firefox",
			}
		}
	}
};
