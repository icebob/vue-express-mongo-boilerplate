<template lang="jade">
	.messages-dropdown(:class="{ 'visible': visible }")
		.panel
			.header 
				.left Messages
				.right
					a.link(href="#") 
						small Mark All as Read
			.body 
				.list
					.item
						img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/dustin/73.jpg")
						.body
							strong Message title 
								small.text-muted John Doe
							p.text-justify Cupidatat eiusmod commodo excepteur velit magna. Aliqua eu tempor officia officia et ipsum magna sint cillum Lorem reprehenderit.
						.footer.text-right
							small.text-muted 1 min ago
					.item
						img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/connor_gaunt/73.jpg")
						.body
							strong Message title 
								small.text-muted John Doe
							p.text-justify Laborum laboris nulla nisi labore.
						.footer.text-right
							small.text-muted 3 min ago

			.footer.text-center
				a.link(href="#") See all messages
</template>

<script>

	export default {

		props: [
			"visible"
		]

	};
	
</script>

<style lang="sass">
</style>