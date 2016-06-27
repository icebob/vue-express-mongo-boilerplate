import moment from "moment";
import { validators } from "vue-form-generator";

module.exports = {
	fields: [
		{
			type: "text",
			label: "ID",
			model: "code",
			readonly: true,
			disabled: true
		},
		{
			type: "select",
			label: "Type",
			model: "type",
			required: true,
			values: [
				{ id: "rasperry", name: "Raspberry" },
				{ id: "odroid", name: "ODroid" },
				{ id: "nanopi", name: "NanoPI" },
				{ id: "pc", name: "PC" }
			],
			default: "raspberry"
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
}