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
				.content.flex.align-center.justify-space-around.buttons
					button.button Normal
					button.button.primary Primary
					button.button.success Success
					button.button.danger Danger
					button.button.outline Outline

				.content.flex.align-center.justify-space-around.buttons
					button.button(disabled="disabled") Normal disabled
					button.button.primary(disabled="disabled") Primary disabled
					button.button.success(disabled="disabled") Success disabled
					button.button.danger(disabled="disabled") Danger disabled
					button.button.outline(disabled="disabled") Outline disabled
				
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
								input.form-control#text1(type='text', name='name', placeholder='Placeholder')
							.form-group.valid
								label(for='text2') Label for valid input
								input.form-control#text2(type='text', name='name', placeholder='Placeholder')
							.form-group.error
								label(for='text3') Label for invalid input
								input.form-control#text3(type='text', name='name', placeholder='Placeholder')

						fieldset
							legend Radio buttons
							.option-container
								input#radio1(type="radio", name="radio")
								label(for="radio1") Option one
							.option-container
								input#radio2(type="radio", name="radio")
								label(for="radio2") Option two
								
						fieldset
							legend Checkboxes
							.option-container
								input#check1(type="checkbox")
								label(for="check1") Option one
							.option-container
								input#check2(type="checkbox")
								label(for="check2") Option two
								
			section
				h2
					span.number 5.
					span.text Alerts
				.content.alerts
					.alert
						| This is a neutral alert.
						a.alert-close(href="x") &times;
					.alert.alert-success
						| This is a success alert.
						a.alert-close(href="x") &times;
					.alert.alert-error
						| This is an error alert.
						a.alert-close(href="x") &times;				
			section
				h2
					span.number 6.
					span.text Tables
				.content.tables
					table.table.stripped.bordered
						thead
							tr
								th #
								th Name
								th 
									i.fa.fa-envelope
									| Mail
								th 
									i.fa.fa-phone
									| Phone
								th.align-right Outstanding
								th Functions
						tbody
							tr
								td 1
								td Johnny Avlony
								td info@johnnyavlony.com
								td (740) 841-7566
								td.align-right $2,400.00
								td.align-right
									button.button Edit
									button.button.danger Disable
							tr
								td 2
								td Johnny Avlony
								td info@johnnyavlony.com
								td (740) 841-7566
								td.align-right $2,400.00
								td.align-right
									button.button Edit
									button.button.danger Disable
							tr.selected
								td 3
								td Johnny Avlony
								td info@johnnyavlony.com
								td (740) 841-7566
								td.align-right $2,400.00
								td.align-right
									button.button Edit
									button.button.danger Disable
							tr.inactive
								td 4
								td Johnny Avlony
								td info@johnnyavlony.com
								td (740) 841-7566
								td.align-right $2,400.00
								td.align-right
									button.button Edit
									button.button.danger Disable
						tfoot
							tr
								td 4
								td 
								td 
								td 
								td.align-right $15,500.00
								td.align-right 

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