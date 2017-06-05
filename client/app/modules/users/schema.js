import Vue from "vue";
import moment from "moment";
import { deviceTypes } from "./types";
import { validators } from "vue-form-generator";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {

	id: "users",
	title: _("Users"),

	table: {
		multiSelect: true,
		columns: [
			{
				title: _("ID"),
				field: "code",
				align: "left",
				formatter(value, model) {
					return model ? model.code : "";
				}
			},
			{
				title: _("FullName"),
				field: "fullName"
			},
			{
				title: _("Email"),
				field: "email"
			},
			{
				title: _("Username"),
				field: "username"
			},
			// {
			// 	title: _("passwordLess?"),
			// 	field: "passwordLess",
			// 	formatter(value, model, col) {
			// 		return value ? "<i class='fa fa-check'/>" : "<i class='fa fa-ban'/>";
			// 	},
			// 	align: "center"
			// },
			// {
			// 	title: _("provider"),
			// 	field: "provider"
			// },
			{
				title: _("Verified"),
				field: "verified",
				formatter(value, model, col) {
					return value ? "<i class='fa fa-check'/>" : "<i class='fa fa-ban'/>";
				},
				align: "center"
			},
			{
				title: _("apiKey"),
				field: "apiKey"
			},
			// {
			// 	title: _("lastLogin"),
			// 	field: "lastLogin",
			// 	formatter(value) {
			// 		return moment(value).fromNow();
			// 	}
			// },
			// {
			// 	title: _("locale"),
			// 	field: "locale"
			// },
			{
				title: _("Status"),
				field: "status",
				formatter(value, model, col) {
					return value ? "<i class='fa fa-check'/>" : "<i class='fa fa-ban'/>";
				},
				align: "center"
			}
		],

		rowClasses: function(model) {
			return {
				inactive: !model.status
			};
		}

	},

	form: {
		fields: [
			{
				type: "input",
				inputType: "text",
				label: _("ID"),
				model: "code",
				readonly: true,
				disabled: true,
				multi: false,
				get(model) {
					if (model.code)
						return model.code;
					else
						return _("willBeGenerated");
				}
			},	
			{
				type: "input",
				inputType: "text",
				label: _("FullName"),
				model: "fullName",
				featured: true,
				required: true,
				placeholder: _("Full Name"),
				validator: validators.string
			},	
			{
				type: "input",
				inputType: "text",
				label: _("Email"),
				model: "email",
				featured: true,
				required: true,
				placeholder: _("Email"),
				validator: validators.email
			},	
			{
				type: "input",
				inputType: "text",
				label: _("Username"),
				model: "username",
				featured: true,
				required: true,
				placeholder: _("Username"),
				validator: validators.string
			},	
			// {
			// 	type: "switch",
			// 	label: _("passwordLess?"),
			// 	model: "passwordLess",
			// 	multi: true,
			// 	default: 1,
			// 	textOn: _("Active"),
			// 	textOff: _("Inactive"),
			// 	valueOn: 1,
			// 	valueOff: 0
			// },
			// {
			// 	type: "input",
			// 	inputType: "text",
			// 	label: _("provider"),
			// 	model: "provider",
			// 	featured: false,
			// 	required: false,
			// 	placeholder: _("defaults to 'local' if blank"),
			// 	validator: validators.string
			// },		
			{
				type: "switch",
				label: _("Verified"),
				model: "verified",
				multi: true,
				default: 0,
				textOn: _("Active"),
				textOff: _("Inactive"),
				valueOn: 1,
				valueOff: 0
			},
			{
				type: "input",
				inputType: "text",
				label: _("apiKey"),
				model: "apiKey",
				placeholder: _("apiKey"),
				validator: validators.string
			},
			// {
			// 	type: "input",
			// 	inputType: "text",
			// 	label: _("locale"),
			// 	model: "locale",
			// 	featured: false,
			// 	required: false,
			// 	validator: validators.string
			// },
			{
				type: "switch",
				label: _("Status"),
				model: "status",
				multi: true,
				default: 1,
				textOn: _("Active"),
				textOff: _("Inactive"),
				valueOn: 1,
				valueOff: 0
			}
		]
	},

	options: {
		searchable: true,


		enableNewButton: true,
		enabledSaveButton: true,
		enableDeleteButton: true,
		enableCloneButton: false,

		validateAfterLoad: false, // Validate after load a model
		validateAfterChanged: false, // Validate after every changes on the model
		validateBeforeSave: true // Validate before save a model
	},

	events: {
		onSelect: null,
		onNewItem: null,
		onCloneItem: null,
		onSaveItem: null,
		onDeleteItem: null,
		onChangeItem: null,
		onValidated(model, errors, schema) {
			if (errors.length > 0)
				console.warn("Validation error in page! Errors:", errors, ", Model:", model);
		}
	},

	resources: {
		addCaption: _("AddNewUser"),
		saveCaption: _("Save"),
		cloneCaption: _("Clone"),
		deleteCaption: _("Delete")
	}

};