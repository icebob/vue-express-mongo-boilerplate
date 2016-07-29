<template lang="jade">
	div
		h3.title {{ schema.title }}

		.level
			.level-left(v-if="enabledNew")
				button.button.is-primary(@click="newModel") {{ schema.resources.addCaption || "Add"}}
			.level-center {{ _("SelectedOfAll", { selected: selected.length, all: rows.length } ) }}
			.level-right(v-if="options.searchable")
				.control.has-icon
					input.input(type="search", :placeholder="_('Search3dots')", v-model="search")
					i.fa.fa-search

		data-table(:schema="schema.table", :rows="rows", :order="order", :search="search", :selected="selected", :select="select", :select-all="selectAll")

		.form(v-if="model")
			vue-form-generator(:schema='schema.form', :model='model', :options='options', :multiple="selected.length > 1", v-ref:form, :is-new-model="isNewModel")

			.errors.text-center
				div.alert.alert-danger(v-for="item in validationErrors", track-by="$index") {{ item.field.label}}: 
					strong {{ item.error }}

			.control.is-grouped.is-grouped-centered
				button.control.button.is-primary(@click="saveModel", :disabled="!enabledSave") {{ schema.resources.saveCaption || _("Save") }}
				button.control.button.is-outlined(@click="cloneModel", :disabled="!enabledClone") {{ schema.resources.cloneCaption || _("Clone") }}
				button.control.button.is-danger(@click="deleteModel", :disabled="!enabledDelete") {{ schema.resources.deleteCaption || _("Delete") }}

			// pre {{{ model | prettyJSON }}}

</template>

<script>
	import Vue from "vue";
	import { schema as schemaUtils } from "vue-form-generator";
	import DataTable from "./DataTable.vue";

	import { each, find, cloneDeep, isFunction } from "lodash";

	export default {

		components: {
			DataTable
		},

		props: [
			"schema",
			"selected",
			"rows"
		],

		data() {
			return {
				search: "",
				order: {
					field: "id",
					direction: 1
				},

				model: null,
				isNewModel: false
			};
		},

		computed: {
			options() 		{ return this.schema.options || {};	},

			enabledNew() 	{ return (this.options.enableNewButton !== false); },
			enabledSave() 	{ return (this.model && this.options.enabledSaveButton !== false); },
			enabledClone() 	{ return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false); },
			enabledDelete() { return (this.model && !this.isNewModel && this.options.enableDeleteButton !== false); },

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
			}

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
					this.$parent.selectRow(row, true);
				} else {
					this.$parent.selectRow(row, false);
				}
			},

			selectAll(event) {
				this.isNewModel = false;

				let filter = Vue.filter("filterBy");
				let filteredRows = filter(this.rows, this.search);

				if (this.selected.length < filteredRows.length) {
					// Select all
					this.$parent.selectRow(filteredRows, false);
				} else {
					// Unselect all 
					this.$parent.clearSelection();
				}
			},	

			generateModel() {
				if (this.selected.length == 1) {
					this.model = cloneDeep(this.selected[0]);
				}
				else if (this.selected.length > 1) {
					this.model = schemaUtils.mergeMultiObjectFields(this.schema.form, this.selected);
				}
				else
					this.model = null;
			},

			newModel() {
				console.log("Create new model...");

				this.$parent.clearSelection();

				let newRow = schemaUtils.createDefaultObject(this.schema.form);
				this.isNewModel = true;
				this.model = newRow;

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			},	

			cloneModel() {
				console.log("Clone model...");
				let baseModel = this.model;
				this.$parent.clearSelection();

				let newRow = cloneDeep(baseModel);
				newRow.id = null;
				newRow.code = null;
				this.isNewModel = true;
				this.model = newRow;
			},

			saveModel() {
				console.log("Save model...");
				if (this.options.validateBeforeSave === false ||  this.validate()) {

					if (this.isNewModel)
						this.$parent.saveRow(this.model);
					else
						this.$parent.updateRow(this.model);

				} else {
					// Validation error
				}
			},

			deleteModel() {
				if (this.selected.length > 0) {
					each(this.selected, (row) => this.$parent.removeRow(row) );
					this.$parent.clearSelection();
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

		created() {
		}	
				
	};

</script>

<style lang="sass" scoped>
	@import "../../scss/variables";

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