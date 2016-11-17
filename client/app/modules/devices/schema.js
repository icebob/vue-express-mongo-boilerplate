import Vue from "vue";
import moment from "moment";
import { deviceTypes } from "./types";
import { validators } from "vue-form-generator";

import { find } from "lodash";

let _ = Vue.prototype._;

module.exports = {

	id: "devices",
	title: _("Devices"),

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
				title: _("Type"),
				field: "type",
				formatter(value) {
					let type = find(deviceTypes, (type) => type.id == value);
					return type ? type.name : value;
				}
			},
			{
				title: _("Address"),
				field: "address"
			},
			{
				title: _("Name"),
				field: "name"
			},
			{
				title: _("Status"),
				field: "status",
				formatter(value, model, col) {
					return value ? "<i class='fa fa-check'/>" : "<i class='fa fa-ban'/>";
				},
				align: "center"
			},
			{
				title: _("LastCommunication"),
				field: "lastCommunication",
				formatter(value) {
					return moment(value).fromNow();
				}
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
				type: "text",
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
				type: "select",
				label: _("Type"),
				model: "type",
				required: true,
				values: deviceTypes,
				default: "rasperry",
				validator: validators.required

			},	
			{
				type: "text",
				label: _("Name"),
				model: "name",
				featured: true,
				required: true,
				placeholder: _("DeviceName"),
				validator: validators.string
			},
			{
				type: "text",
				label: _("Description"),
				model: "description",
				featured: false,
				required: false,
				validator: validators.string
			},	
			{
				type: "text",
				label: _("Address"),
				model: "address",
				placeholder: _("AddressOfDevice"),
				validator: validators.string
			},
			{
				type: "label",
				label: _("LastCommunication"),
				model: "lastCommunication",
				get(model) { return model && model.lastCommunication ? moment(model.lastCommunication).fromNow() : "-"; }
			},
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
		addCaption: _("AddNewDevice"),
		saveCaption: _("Save"),
		cloneCaption: _("Clone"),
		deleteCaption: _("Delete")
	}

};