<template lang="pug">
	table.table.stripped
		thead
			tr
				th.selector(v-if="schema.multiSelect", width="20px" @click="selectAll") 
					i.fa.fa-square-o
				th.sortable(v-for="col in schema.columns", :width="col.width || 'auto'", @click="changeSort(col)", :class="{ sorted: col.field == order.field, 'desc': col.field == order.field && order.direction == -1 }") {{ col.title }}
		
		tbody
			tr(v-for="row in filteredOrderedRows", @click="select($event, row)", :class="getRowClasses(row)")
				td.selector(v-if="schema.multiSelect", width="20px", @click.stop.prevent="select($event, row, true)") 
					i.fa.fa-square-o
				td(v-for="col in schema.columns", :class="getCellClasses(row, col)") 
					span(v-html="getCellValue(row, col)")
					span.labels(v-if="col.labels != null")
						.label(v-for="label in col.labels(row)", :class="'label-' + label.type") {{ label.caption }}
		tfoot
			tr
				td
				td(v-for="col in schema.columns") &nbsp;

</template>

<script>
	import {each, isObject, isArray, isFunction, isNil,  isString, defaults, orderBy, includes, get} from "lodash";

	function searchInObject(obj, text) {
		text = text.toLowerCase();
		let values = Object.values(obj);
		let res = values.filter(val => {
			if (isObject(val)) {
				return searchInObject(val, text);
			} else if (isArray(val)) {
				return val.filter(item => searchInObject(item, text));
			} else if (isString(val)) {
				return val.toLowerCase().indexOf(text) != -1
			}
		});
		return res.length > 0;
	}

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

		computed: {
			filteredOrderedRows() {
				let items = this.rows;
				if (this.search) {
					let search = this.search.toLowerCase();
					items = this.rows.filter(function (row) {
						return searchInObject(row, search)
					});
				}

				return orderBy(items, this.order.field, this.order.direction == 1 ? "asc" : "desc");
			}
		},

		methods: {

			/**
			 * Get the cell value from row. If the schema of column 
			 * has a get() method, it will call it, otherwise, get 
			 * the value from the row property
			 * 
			 * @param  {Object} row 	Row object
			 * @param  {Object} col 	Column definition
			 * @return {*}      		Cell value
			 */
			getCellValue(row, col) {
				let value;
				if (!col.field && isFunction(col.get))
					value = col.get(row);
				else 
					value = get(row, col.field);
				
				return this.tableFormatter(row, col, value);
			},

			/**
			 * Format the cell value by schema
			 *
			 * You can add custom formatter func in schema.table.columns. It can be also an array of functions.
			 * 
			 * @param  {Object} row 	Row object
			 * @param  {Object} col 	Column definition
			 * @param  {*} 		value Value of cell
			 * @return {String}       Formatted string
			 */
			tableFormatter(row, col, value) {
				if (isNil(value)) return;
				let formatter = col.formatter;
				if (formatter) {
					if (isArray(formatter)) {
						each(formatter, (fmt) => {
							value = fmt(value, row, col);
						});
					} else if (isFunction(formatter))
						value = formatter(value, row, col);
				}

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
			changeSort(col) {
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

<style lang="scss" scoped>

</style>