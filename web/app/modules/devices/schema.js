import moment from "moment";
import { deviceTypes } from "./types";
import { validators } from "vue-form-generator";

import { find } from "lodash";

module.exports = {

	id: "devices",
	title: "Devices",

	table: {
		multiSelect: true,
		columns: [
			{
				title: "ID",
				field: "id",
				align: "left",
				formatter(value, model) {
					return model ? `${model.id} - ${model.code}` : "";
				}
			},
			{
				title: "Type",
				field: "type",
				formatter(value) {
					let type = find(deviceTypes, (type) => type.id == value);
					return type ? type.name : value;
				}
			},
			{
				title: "Address",
				field: "address"
			},
			{
				title: "Name",
				field: "name"
			},
			{
				title: "Status",
				field: "status",
				formatter(value, model, col) {
					return value ? "<i class='fa fa-check'/>" : "<i class='fa fa-ban'/>"
				},
				align: "center"
			},
			{
				title: "Last communication",
				field: "lastCommunication",
				formatter(value) {
					return moment(value).fromNow();
				}
			}
		],

		rowClasses: function(model) {
			return {
				inactive: !model.status
			}
		}

	},

	form: {
		fields: [
			{
				type: "text",
				label: "ID",
				model: "id",
				readonly: true,
				disabled: true,
				multi: false,
				get(model) {
					if (model.id)
						return model ? `${model.id} - ${model.code}` : "";
					else
						return "<will be generated>";
				}
			},
			{
				type: "select",
				label: "Type",
				model: "type",
				required: true,
				values: deviceTypes,
				default: "rasperry",
				validator: validators.required

			},	
			{
				type: "text",
				label: "Name",
				model: "name",
				featured: true,
				required: true,
				placeholder: "Device name",
				validator: validators.string
			},
			{
				type: "text",
				label: "Description",
				model: "description",
				featured: false,
				required: false,
				validator: validators.string
			},	
			{
				type: "text",
				label: "Address",
				model: "address",
				placeholder: "Address of device",
				validator: validators.string
			},
			{
				type: "label",
				label: "Last communication",
				model: "lastCommunication",
				get(model) { return model && model.lastCommunication ? moment(model.lastCommunication).fromNow() : "-"; }
			},
			{
				type: "switch",
				label: "Status",
				model: "status",
				multi: true,
				default: true,
				textOn: "Active",
				textOff: "Inactive"
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
		addCaption: "Add new device",
		saveCaption: "Save",
		cloneCaption: "Clone",
		deleteCaption: "Delete"
	},

}