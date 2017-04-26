<template lang="pug">
	.notification-dropdown(:class="{ 'visible': visible }")
		.panel
			.header 
				.left {{ "Notifications" | i18n }}
				.right
					a.link(href="#") 
						small {{ "MarkAllAsRead" | i18n }}
			.body 
				.list
					.item
						img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/dustin/73.jpg")
						.body
							p.text-justify 
								strong Thomas 
								| posted a new article
						.footer.text-right
							small.text-muted 1 min ago
					.item
						img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/connor_gaunt/73.jpg")
						.body
							p.text-justify 
								strong Adam 
								| changed his contact information
						.footer.text-right
							small.text-muted 3 min ago
					.item
						img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/73.jpg")
						.body
							p.text-justify 
								strong Samantha 
								| replied to your comment
						.footer.text-right
							small.text-muted 15 min ago
					.item
						img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/ritu/73.jpg")
						.body
							p.text-justify 
								strong Bill 
								| bought a new TV
						.footer.text-right
							small.text-muted 3 hours ago
					.item
						img.avatar(src="https://s3.amazonaws.com/uifaces/faces/twitter/sauro/73.jpg")
						.body
							p.text-justify 
								strong Chris 
								| posted a new blog post
						.footer.text-right
							small.text-muted 1 day ago
			.footer.text-center
				a.link(href="#") {{ "SeeAllNotifications" | i18n }}



</template>

<script>

	export default {

		props: [
			"visible"
		]

	};
	
</script>

<style lang="scss">
</style>