<template lang="jade">
	.container
		h1 Style guide

		.guide
			section
				h2
					span.number 1.
					span.text Color palette
				.content.flex.align-center.justify-space-around.colors
					.box.box1
						.main
						.light
						.dark
						.code
					.box.box2
						.main
						.light
						.dark
						.code
					.box.box3
						.main
						.light
						.dark
						.code
					.box.box4
						.main
						.light
						.dark
						.code
					.box.box5
						.main
						.light
						.dark
						.code
						
			section
				h2
					span.number 2.
					span.text Typography
				.content.typo
					.headers
						h1 Heading #1 - {{ getTypographyInfo("h1") }}
						h2 Heading #2 -  {{ getTypographyInfo("h2") }}
						h3 Heading #3 -  {{ getTypographyInfo("h3") }}
						h4 Heading #4 -  {{ getTypographyInfo("h4") }}
						h5 Heading #5 -  {{ getTypographyInfo("h5") }}
						
					.paragraph
						p Paragraph - {{ getTypographyInfo("p") }}
						p ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 éáűőúöüóí ÉÁŰŐÚÖÜÓÍ
						p An example paragraph with 
							strong strong text
							|  and 
							em emphasized text
							| , spanning 
							br
							| multiple lines so you can see the line-height.
						p.text-justify Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec varius ipsum tortor, eget convallis ante sagittis ac. Nulla eget bibendum dolor. Praesent at ipsum bibendum, malesuada quam tincidunt, lobortis purus. Donec vel mi mollis, sagittis libero non, ultrices elit. Nulla non mauris in sapien mattis scelerisque. Vivamus maximus tincidunt mi, interdum pellentesque urna feugiat sed. Suspendisse vulputate metus leo, nec hendrerit sapien tincidunt ac. Vivamus non libero luctus, suscipit libero ut, elementum enim. 
							a(href="#") Read more

						p Fusce aliquam sem lorem, in porttitor orci dignissim at. Sed non dolor at orci dignissim bibendum a non nibh. Duis nec vestibulum dui, sit amet lobortis ligula. Sed aliquam mauris nunc, eu sodales est faucibus vitae. Ut sed accumsan lectus. Interdum et 
							a(href="#") malesuada
							|  fames ac ante ipsum primis in faucibus. Aenean dignissim odio vehicula ligula varius, ac ullamcorper tortor molestie. Phasellus dolor dui, egestas id ornare in, suscipit et dolor.

			section
				h2
					span.number 3.
					span.text Buttons
				fieldset
					legend Normal buttons
					.content.flex.align-center.justify-space-around.buttons
						button.button Normal
						button.button.primary Primary
						button.button.success 
							i.icon.fa.fa-check
							| Success
						button.button.warning Warning
						button.button.danger Danger
						button.button.outline Outline
						button.button.loading Loading

				fieldset
					legend Large buttons
					.content.flex.align-center.justify-space-around.buttons
						button.button.large Normal
						button.button.large.primary Primary
						button.button.large.success 
							i.icon.fa.fa-check
							| Success
						button.button.large.warning Warning
						button.button.large.danger Danger
						button.button.large.outline Outline
						button.button.large.loading Loading

				fieldset
					legend Small buttons
					.content.flex.align-center.justify-space-around.buttons
						button.button.small Normal
						button.button.small.primary Primary
						button.button.small.success
							i.icon.fa.fa-check
							| Success
						button.button.small.warning Warning
						button.button.small.danger Danger
						button.button.small.outline Outline
						button.button.small.loading Loading

				fieldset
					legend Disabled buttons
					.content.flex.align-center.justify-space-around.buttons
						button.button(disabled="disabled") Normal
						button.button.primary(disabled="disabled") Primary
						button.button.success(disabled="disabled")
							i.icon.fa.fa-check
							| Success
						button.button.warning(disabled="disabled") Warning
						button.button.danger(disabled="disabled") Danger
						button.button.outline(disabled="disabled") Outline

				fieldset
					legend Icon buttons
					.content.flex.align-center.justify-space-around.buttons
						button.button
							i.fa.fa-home
						button.button.primary
							i.fa.fa-tasks
						button.button.success 
							i.fa.fa-cogs
						button.button.warning
							i.fa.fa-comments
						button.button.danger
							i.fa.fa-trash
						button.button.outline
							i.fa.fa-pencil

				fieldset
					legend Floating buttons
					.content.flex.align-center.justify-space-around.buttons
						button.button.fab
							i.icon.fa.fa-plus
							| Normal
						button.button.fab.large.primary 
							i.icon.fa.fa-plus
							| Primary
						button.button.fab.success
							i.icon.fa.fa-check
							| Success
						button.button.fab.warning(disabled="disabled")
							i.icon.fa.fa-comments
							| Warning
						button.button.fab.danger
							i.icon.fa.fa-trash
							| Danger
						button.button.fab.outline
							i.icon.fa.fa-bars
							| Outline				

				fieldset
					legend Button group
					.content.flex.align-center.justify-space-around.buttons
						.button-group
							button.button 
								i.icon.fa.fa-align-left
								| Left
							button.button
								i.icon.fa.fa-align-center
								| Middle
							button.button
								i.icon.fa.fa-align-right
								| Right
				hr

			section
				h2
					span.number 4.
					span.text Form elements
				.content.forms
					form(action='#')
						fieldset
							legend Input fields

							.form-group
								label(for='text1') Label
								input.form-control#text1(type='text', placeholder='Placeholder')

							.form-group
								label(for='text2') Label with hint
								input.form-control#text2(type='text', placeholder='Placeholder')
								.hint Maxium 100 characters
							.form-group.has-icon.valid
								label(for='text3') Label for valid input
								input.form-control#text3(type='text', placeholder='Placeholder')
								i.icon.fa.fa-check
							.form-group.has-icon.error
								label(for='text4') Label for invalid input with error messages
								input.form-control#text4(type='text', placeholder='Placeholder')
								i.icon.fa.fa-exclamation-triangle
								.errors
									span Too short!
									span Invalid text content!

							.form-group
								label(for='text5') Label for textarea
								textarea.form-control#text5(type='text', placeholder='Placeholder', rows=5)

						fieldset
							legend Selections
							.form-group
								label(for='select1') Label for select
								select.form-control#select1
									option Option 1
									option Option 2
									option Option 3 
									option Option 4

						fieldset
							legend Radio buttons
							.form-option
								input#radio1(type="radio", name="radio")
								label(for="radio1") Option one
							.form-option
								input#radio2(type="radio", name="radio")
								label(for="radio2") Option two
								
						fieldset
							legend Checkboxes
							.form-option
								input#check1(type="checkbox")
								label(for="check1") Option one
							.form-option
								input#check2(type="checkbox")
								label(for="check2") Option two
								
			section
				h2
					span.number 5.
					span.text Alerts
				.content.alerts
					.alert 
						i.icon.fa.fa-info-circle
						| This is a neutral alert.						
					.alert.alert-success
						i.icon.fa.fa-check
						| This is a success alert.
						a.alert-close(href="x") &times;
					.alert.alert-warning
						i.icon.fa.fa-exclamation-triangle
						| This is a warning alert.
						a.alert-close(href="x") &times;				
					.alert.alert-error
						i.icon.fa.fa-times-circle
						strong Error!
						| This is an error alert.
						a.alert-close(href="x") &times;		

					.alert.alert-success
						h4 Well done!
						p Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.
			section
				h2
					span.number 6.
					span.text Tables
				.content.tables
					table.table.stripped.bordered
						thead
							tr
								th #
								th.sortable Name
								th.sortable 
									i.fa.fa-envelope
									| Mail
								th.sortable 
									i.fa.fa-phone
									| Phone
								th.sortable.text-right Outstanding
								th.text-right Functions
						tbody
							tr
								td 1
								td Johnny Avlony
								td info@johnnyavlony.com
								td (740) 841-7566
								td.text-right $2,400.00
								td.text-right
									button.button.small Edit
									button.button.small.danger 
										i.icon.fa.fa-trash
										| Delete
							tr
								td 2
								td Johnny Avlony
								td info@johnnyavlony.com
								td (740) 841-7566
								td.text-right $2,400.00
								td.text-right
									button.button.small Edit
									button.button.small.danger 
										i.icon.fa.fa-trash
										| Delete
							tr.selected
								td 3
								td Johnny Avlony
								td info@johnnyavlony.com
								td (740) 841-7566
								td.text-right $2,400.00
								td.text-right
									button.button.small Edit
									button.button.small.danger 
										i.icon.fa.fa-trash
										| Delete
							tr.inactive
								td 4
								td Johnny Avlony
								td info@johnnyavlony.com
								td (740) 841-7566
								td.text-right $2,400.00
								td.text-right
									button.button.small Edit
									button.button.small.danger 
										i.icon.fa.fa-trash
										| Delete
						tfoot
							tr
								td 4
								td 
								td 
								td 
								td.text-right $15,500.00
								td.text-right 

			section
				h2
					span.number 7.
					span.text Tags / badges
				fieldset
					legend Tags

					.content.flex.align-center.justify-space-around.buttons
						.tag Normal
						.tag.primary Primary
						.tag.success Success
						.tag.warning Warning
						.tag.danger Danger
						.tag.outline Outline

				fieldset
					legend Number tags
					
					.content.flex.align-center.justify-space-around.buttons
						.tag.pill 15
						.tag.pill.primary 5
						.tag.pill.success 100+
						.tag.pill.warning 45
						.tag.pill.danger 0
						.tag.pill.outline 8


			section
				h2
					span.number 8.
					span.text Progress bars
				fieldset
					legend Normal

					.content.buttons
						.progressbar
							.progress(style="width: 15%;")
						br
						.progressbar.success
							.progress(style="width: 40%;") 40% complete...
						br
						.progressbar.warning
							.progress(style="width: 60%;") 60%
						br
						.progressbar.danger
							.progress(style="width: 70%;")

				fieldset
					legend Stripped

					.content.buttons
						.progressbar.stripped.success
							.progress(style="width: 40%;") 40% complete...
						br
						.progressbar.stripped.danger
							.progress(style="width: 70%;")
				
				fieldset
					legend Animated

					.content.buttons
						.progressbar.stripped.animate.success
							.progress(style="width: 80%;") 80% complete...
						br
						.progressbar.stripped.animate.warning
							.progress(style="width: 34%;")

				fieldset
					legend Small

					.content.buttons
						.progressbar.small
							.progress(style="width: 15%;")
						br
						.progressbar.small.success.stripped
							.progress(style="width: 40%;") 40% complete...
						br
						.progressbar.small.warning.stripped.animate
							.progress(style="width: 60%;") 60%


				fieldset
					legend Large

					.content.buttons
						.progressbar.large
							.progress(style="width: 15%;")
						br
						.progressbar.large.success.stripped
							.progress(style="width: 40%;") 40% complete...
						br
						.progressbar.large.warning.stripped.animate
							.progress(style="width: 60%;") 60%
					
</template>

<script>
	// http://codepen.io/icebob/pen/GJqxNN

	export default {

		methods: {
			getTypographyInfo(elType) {
				let element = this.$el.querySelector(elType);
				if (element) {
					let style = window.getComputedStyle(element, null);
					return style.fontFamily.split(",")[0] + ' ' + style.fontWeight + ', ' + style.fontSize;
				}
			}
		}
	};

</script>

<style lang="sass" scoped>
	@import "../../../scss/themes/blurred/variables";

	.container {
		padding: 1rem;
	}

	section {
		margin-bottom: 40px;
		> h2 {
			font-size: 1.5rem;
			margin-bottom: 20px;
			padding: 8px 10px;
			
			background-color: rgba(darken($backgroundColor, 10%), 0.6);
			border: 1px solid darken($backgroundColor, 8%);
			border-radius: 8px;
			
			.number {
				color: #888;
			}
			
			.text {
				margin-left: 4px;
				font-weight: $fontLight;
				text-transform: uppercase;
			}
			
			clear: both;
			
		} // .title

	} //. section	

	.buttons {
		margin-bottom: 20px;
	}

	.colors {
		$boxSize: 150px;

		.box {
			width: $boxSize;
			height: $boxSize;

			border: 1px solid darken($backgroundColor, 10%);
			border-radius: 6px;

			margin: 5px 20px;
			padding: 2px;
			
			.main {
				float: left;
				width: 100%;
				height: $boxSize - 60px;
			} // .main
			
			.light {
				float: left;
				width: 50%;
				height: 30px;
				
			} // .light

			.dark {
				float: right;
				width: 50%;
				height: 30px;
				
			} // .dark
			
			.code {
				float: left;
				width: 100%;
				position: relative;
				margin-top: 5px;
				
				&:after {
					position: absolute;
					top: 0; bottom: 0;
					left: 0; right: 0;
					margin: auto;
					width: 100%;
					text-align: center;
					font-family: "Consolas";
					color: White;
				}
			} // .code

			$colors: $color1, $color2, $color3, $color4, $color5;

			$colors-light: $color1-light, $color2-light, $color3-light, $color4-light, $color5-light;
			$colors-dark: $color1-dark, $color2-dark, $color3-dark, $color4-dark, $color5-dark;

			@for $i from 1 through 5 {

				$c: nth($colors, $i);

				&.box#{$i} { 
					.main { background-color: $c; } 
					.light { background-color: nth($colors-light, $i); }
					.dark { background-color: nth($colors-dark, $i); }
					.code:after {	content: "" + $c; }

				} // box
				
			} // for
			
		} // .box
		
	} // .colors
</style>