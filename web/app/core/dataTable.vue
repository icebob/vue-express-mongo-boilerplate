<template lang="jade">
	table
		thead
			tr
				th.selector(v-if="schema.multiSelect", width="20px" @click="selectAll") 
					i.fa.fa-square-o
				th.sortable(v-for="col in schema.columns", width="{{ col.width || 'auto' }}", @click="orderBy(col)", :class="{ sorted: col.field == order.field, 'desc': col.field == order.field && order.direction == -1 }") {{ col.title }}
		
		tbody
			tr(v-for="row in rows | filterBy search | orderBy order.field order.direction", @click="select($event, row)", :class="getRowClasses(row)")
				td.selector(v-if="schema.multiSelect", width="20px", @click.stop.prevent="select($event, row, true)") 
					i.fa.fa-square-o
				td(v-for="col in schema.columns", :class="getCellClasses(row, col)") 
					| {{{ getCellValue(this, row, col) | tableFormatter }}}
					span.labels(v-if="col.labels != null")
						.label(v-for="label in col.labels(row)", :class="'label-' + label.type") {{ label.caption }}


</template>

<script>
	import {each, isArray, isFunction, isNil, defaults} from "lodash";


	export default {

		props: [
			"schema",
			"rows",
			"selected",
			"order",
			"select",
			"selectAll",
			"search"
		],

		filters: {
			/**
			 * Format the cell value by schema
			 *
			 * You can add custom formatter func in schema.table.columns. It can be also an array of functions.
			 * 
			 * @param  {*} 		value Value of cell
			 * @return {String}       Formatted string
			 */
			tableFormatter: function(value) {
				if (isNil(value)) return;
				let formatter = this.col.formatter;
				if (formatter) {
					if (isArray(formatter)) {
						each(formatter, (fmt) => {
							value = fmt(value, this.row, this.col);
						});
					} else if (isFunction(formatter))
						value = formatter(value, this.row, this.col);
				}

				return value;
			}
		},

		methods: {

			/**
			 * Get the cell value from row. If the schema of column 
			 * has a get() method, it will call it, otherwise, get 
			 * the value from the row property
			 * 
			 * @param  {Object} self 	Iterator object
			 * @return {*}      		Cell value
			 */
			getCellValue(self) {
				let col = self.col;
				let value;
				if (!col.field && isFunction(col.get))
					value = col.get(self.row);
				else 
					value = self.$get("row." + self.col.field);
				
				return value;
			},

			/**
			 * Get classes for row. Handle the selected row.
			 * If has 'rowClasses' in schema, it will be called.
			 * 
			 * @param  {Object} row Row object
			 * @return {Object}     Object with classes
			 */
			getRowClasses(row) {
				// Default classes
				let res = {
					selected: this.isSelected(row)
				};

				// Classes from schema
				if (isFunction(this.schema.rowClasses))
					res = defaults(this.schema.rowClasses(row), res); 
				
				return res;
			},

			/**
			 * Get classes for cell. Handle the column.align property
			 * @param  {Object} row Row object
			 * @param  {Object} col Column schema
			 * @return {Object}     Object with classes
			 */
			getCellClasses(row, col) {
				if (!isNil(col.align))
					return {
						["align-" + col.align]: true
					};
			},

			/**
			 * Change the sort field and direction.
			 * If field is changed, the direction will be ascending.
			 * If field is not changed, toggle the direction
			 * 
			 * @param  {Object} col Column schema
			 * @return {[type]}     [description]
			 */
			orderBy(col) {
				if (col.field) {
					if (this.order.field == col.field) {
						this.order.direction *= -1;
					} else {
						this.order.field = col.field;
						this.order.direction = 1;
					}
				}
			},

			/**
			 * Get the row is selected
			 * @param  {Object}  row Row object
			 * @return {Boolean}     Is selected?
			 */
			isSelected(row) {
				return this.selected.indexOf(row) != -1;
			}

		}

	};

</script>

<style lang="sass" scoped>
	@import "../../scss/variables";

	table {
		width: 100%;
		//border: 1px solid #AAA;
		//border-collapse: collapse;

		thead tr {

			th {
				font-size: 1.2em;
				padding: 3px 5px;
				text-transform: uppercase;
				text-align: center;
				cursor: default;

				&.sortable {
					&:after {
						content: "\f0dc";
						float: right;
						font-family: fontawesome;
						font-size: 0.9em;
						color: rgba(100,100,100,1);
					}

					&.sorted {
						&:after {
							content: "\f0dd";
							color: rgba(250,250,250,1);
						}

						&.desc:after {
							content: "\f0de";
						}

					}

				}
			}
		}

		tbody tr {
			cursor: pointer;

			td {
				text-align: center;
				/*border: 1px solid #CCC;
				font-size: 0.9em;
				padding: 3px 5px;*/

				span.labels {
					margin-left: 0.3em;

					.label {
						margin: 0 0.2em;
					}
				}

				&.align-left   { text-align: left }
				&.align-center { text-align: center }
				&.align-right  { text-align: right }
			}

			&.inactive {
				color: #BBB;
				font-style: italic;
			}
/*
			&:hover {
				background-color: #EEE;
			}*/

			&.selected {
				background-color: rgba($masterColor, 0.3);
				td {
					//font-weight: 600;
				}

				td.selector i:before {
					content: "\f046";
				}
			}
		}

	}

</style>