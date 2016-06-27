<template lang="jade">
	div
		h3 Devices page

		table(v-if="devices.length > 0")
			thead
				tr
					th ID
					th Address
					th Name
					th Description
					th Status
					th Last communication

			tbody
				tr(v-for="device in devices", @click="select(device)", :class="{ selected: device == selected }")
					td {{ device.code }}
					td {{ device.address }}
					td {{ device.name }}
					td {{ device.description }}
					td {{ device.status | status }}
					td {{ device.lastCommunication | ago }}

		.device-form
			.errors.text-center
				div.alert.alert-danger(v-for="item in validationErrors", track-by="$index") {{ item.field.label}}: 
					strong {{ item.error }}

			.buttons.text-center
				button.btn.btn-default.new(@click="newModel") 
					i.fa.fa-plus
					| New
				button.btn.btn-primary.save(@click="saveModel") 
					i.fa.fa-floppy-o
					| Save
				button.btn.btn-danger.delete(@click="deleteModel") 
					i.fa.fa-trash
					| Delete

			vue-form-generator(:schema='schema', :model='model', :options='formOptions', :multiple="false", v-ref:form, :is-new-model="isNewModel")

</template>

<script>
	import Vue from "vue";
	import VueFormGenerator from "vue-form-generator";
	import Schema from "./schema";

	import { cloneDeep } from "lodash";

	import { getDevices, selectDevice } from "../../vuex/actions";
	import { devices, selected } from "../../vuex/getters";

	// Initialize vue-form-generator
	Vue.use(VueFormGenerator);

	export default {

		data() {
			return {
				schema: Schema,
				model: null,
				isNewModel: false,

				formOptions: {
					validateAfterLoad: true,
					validateAfterChanged: false,
					validateBeforeSave: true
				}
			}
		},

		vuex: {
			getters: {
				devices,
				selected
			},
			actions: {
				selectDevice
			}
		},	

		filters: {
			status(val) {
				if (val == 1)
					return "Active";
				else
					return "Inactive";
			}
		},	

		computed: {
			validationErrors() {
				if (this.$refs.form && this.$refs.form.errors) 
					return this.$refs.form.errors;

				return [];
			}
		},	

		methods: {
			select(device) {
				this.model = cloneDeep(device);

				this.selectDevice(this.$store, device);
			},

			newModel() {
				console.log("Create new model...");
				this.selectDevice(null);

				let newRow = VueFormGenerator.schema.createDefaultObject(Schema)
				this.isNewModel = true;
				this.model = newRow;

				let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
				if (el)
					el.focus()

			},			

			saveModel() {
				console.log("Save model...");
				if (this.formOptions.validateBeforeSave === false ||  this.validate()) {

					if (this.isNewModel) {
						this.$http.post("/devices", this.model).then((response) => {
							let res = response.json();
							// TODO add new device to store.device.all
						});						
					} else
						this.$http.put("/devices/" + this.model.code, this.model).then((response) => {
							let res = response.json();
							// TODO refresh device properties from response
						});

				} else {
					// Validation error
				}
			},

			deleteModel() {
				if (this.selected) {
					this.$http.delete("/devices/" + this.model.code).then((response) => {
						this.selectDevice(null);
					});
				}
			},

			validate()	{
				return this.$refs.form.validate();
			}			
		},	

		route: {
			activate() {

			},

			data(transition) {
				
			}
		},

		created() {
			getDevices(this.$store);
		}
	}
</script>

<style lang="sass" scoped>
	@import "../../../scss/variables";

	table {
		width: 100%;

		tr {
			cursor: pointer;

			td {
				text-align: center;
			}

			&.selected {
				background-color: rgba($masterColor, 0.3);
			}
		}

	}
</style>