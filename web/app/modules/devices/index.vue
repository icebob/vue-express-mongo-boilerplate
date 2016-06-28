<template lang="jade">
	div
		h3 {{ schema.title }}

		.headerbar
			.newItem(v-if="options.enableNewButton !== false")
				button.btn.btn-primary.new(@click="newModel") {{ schema.resources.addCaption || "Add"}}
			.info Selected {{ selected.length }} of {{ rows.length }}
			.searchBar.input-group
				span.input-group-addon
					i.fa.fa-search
				input.form-control(type="search", placeholder="Search...", v-model="search")

		data-table(:schema="schema.table", :rows="rows", :order="order", :search="search", :selected="selected", :select="select", :select-all="selectAll")

		.form(v-if="model")
			vue-form-generator(:schema='schema.form', :model='model', :options='options', :multiple="false", v-ref:form, :is-new-model="isNewModel")

			.errors.text-center
				div.alert.alert-danger(v-for="item in validationErrors", track-by="$index") {{ item.field.label}}: 
					strong {{ item.error }}

			.buttons.text-center
				button.btn.btn-primary.save(@click="saveModel", :disabled="!enabledSave") {{ schema.resources.saveCaption || "Save"}}
				button.btn.btn-warning.clone(@click="cloneModel", :disabled="!enabledClone") {{ schema.resources.cloneCaption || "Clone"}}
				button.btn.btn-danger.delete(@click="deleteModel", :disabled="!enabledDelete") {{ schema.resources.deleteCaption || "Delete"}}


</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import DataTable from '../../core/dataTable.vue';
	import Schema from "./schema";
	import types from "./types";

	import { each, find, cloneDeep, isFunction } from "lodash";

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	console.log(actions);

	export default {

		components: {
			DataTable
		},

		data() {
			return {
				search: '',
				schema: Schema,
				order: {
					field: null,
					direction: 1
				},

				model: null,
				isNewModel: false
			}
		},

		vuex: {
			getters,
			actions
		},	

		filters: {
			status(val) {
				if (val == 1)
					return "Active";
				else
					return "Inactive";
			},

			deviceType(val) {
				let type = find(types.deviceTypes, (type) => type.id == val);
				return type ? type.name : "";
			}
		},	

		computed: {
			options() {
				return this.schema.options || {};
			},

			enabledSave() {
				return (this.model && this.options.enabledSaveButton !== false);
			},

			enabledClone() {
				return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false);
			},

			enabledDelete() {
				return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false);
			},

			validationErrors() {
				if (this.$refs.form && this.$refs.form.errors) 
					return this.$refs.form.errors;

				return [];
			}
		},	

		watch: {
			selected() {
				if (!this.isNewModel)
					this.generateModel();
			},

			/*
			model: {
				handler: function(newVal, oldVal) {
					if (newVal === oldVal) // call only if a property changed, not the model
						console.log("Model property changed!");
				},
				deep: true
			}*/
		},

		methods: {

			select(event, row, add) {
				this.isNewModel = false;
				
				if (this.schema.table.multiSelect === true && (add || (event && event.ctrlKey))) {
					this.selectDevice(row, true);
				} else {
					this.selectDevice(row, false);
				}
			},

			selectAll(event) {
				this.isNewModel = false;

				let filter = Vue.filter('filterBy');
				let filteredRows = filter(this.rows, this.search);

				if (this.selected.length < filteredRows.length) {
					// Select all
					this.selectDevice(filteredRows, false);
				} else {
					// Unselect all 
					this.clearSelection();
				}
			},	

			generateModel() {
				if (this.selected.length == 1) {
					this.model = cloneDeep(this.selected[0]);
				}
				else if (this.selected.length > 1) {
					this.model = schemaUtils.mergeMultiObjectFields(this.schema.form, this.selected);
					//console.log("Model: ", this.model);
				}
				else
					this.model = null;
			},

			newModel() {
				console.log("Create new model...");

				this.clearSelection();

				let newRow = schemaUtils.createDefaultObject(this.schema.form);
				this.isNewModel = true;
				this.model = newRow;
				console.log(this.model);

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus()
				});
			},	

			cloneModel() {
				console.log("Clone model...");
				let baseModel = this.model;
				this.clearSelection();

				let newRow = cloneDeep(baseModel);
				newRow.id = null;
				newRow.code = null;
				this.isNewModel = true;
				this.model = newRow;
			},

			saveModel() {
				console.log("Save model...");
				if (this.options.validateBeforeSave === false ||  this.validate()) {

					if (this.isNewModel) {
						this.$http.post("/devices", this.model).then((response) => {
							let res = response.data;
							// It's not neccessary, because we will get the new object via websocket
							//if (res.data)
							//	this.addDevice(res.data);
						});						
					} else
						this.$http.put("/devices/" + this.model.code, this.model).then((response) => {
							let res = response.data;
							if (res.data)
								this.updateDevice(res.data);
						});

				} else {
					// Validation error
				}
			},

			deleteModel() {
				if (this.selected.length > 0) {
					each(this.selected, (device) => {
						this.$http.delete("/devices/" + device.code).then((response) => {
							this.removeDevice(device);
						});
					});
					this.clearSelection();
				}
			},

			validate()	{
				let res = this.$refs.form.validate();

				if (this.schema.events && isFunction(this.schema.events.onValidated)) {
					this.schema.events.onValidated(this.model, this.$refs.form.errors, this.schema);
				}

				if (!res) {
					// Set focus to first input with error
					this.$nextTick(() => {
						let el = document.querySelector("div.form tr.error input:nth-child(1)");
						if (el)
							el.focus();
					});
				}

				return res;	
			}			
		},	

		route: {
			activate() {

			},

			data(transition) {
				
			}
		},

		created() {
			this.downloadDevices();

			console.log("Add io handlers...");

			this.$socket.on("newDevice", (device) => {
				console.log("New device added: ", device);
				this.addDevice(device);
			});			

			this.$socket.on("updateDevice", (device) => {
				console.log("Update device: ", device);
				this.updateDevice(device);
			});			

			this.$socket.on("removeDevice", (device) => {
				console.log("Remove device: ", device);
				this.removeDevice(device);
			});			

		},

		destroyed() {
			console.log("Remove io handlers...");
			this.$socket.off("newDevice");
			this.$socket.off("updateDevice");
			this.$socket.off("removeDevice");
		}
	}
</script>

<style lang="sass" scoped>
	@import "../../../scss/variables";

	.headerbar {
		display: flex;
		justify-content: space-between;
		align-self: middle;
		margin-bottom: 0.5em;

		.info {
			margin: auto;
		}
		
		.searchBar {
			width: 300px;

			.input-group-addon {
				background-color: inherit;
				padding: 6px 6px;
			}

			input {
				font-family: "Open Sans";
				border-left: 0;
				padding-left: 6px;
			}
		}


	}

	.form {
		background-color: #EEE;
		color: Black;

		margin: 1rem;

		.buttons {
			margin: 10px 0;
			text-align: center;
			button {
				margin: 0 10px;
				padding: 6px 20px;

				border-radius: 4px;
				border: 1px solid #666;
			}
		}
	}
</style>