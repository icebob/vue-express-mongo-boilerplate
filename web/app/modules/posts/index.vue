<template lang="jade">
	h3 Posts

	.header
		.sort
			a(@click="setSort('hot')", :class="{ active: sort == 'hot' }") Hot
			a(@click="setSort('mostviewed')", :class="{ active: sort == 'mostviewed' }") Most viewed
			a(@click="setSort('new')", :class="{ active: sort == 'new' }") New

		.add
			button(@click="newPost") New post

		.filter 
			a(@click="setViewMode('all')", :class="{ active: viewMode == 'all' }") All posts
			a(@click="setViewMode('my')", :class="{ active: viewMode == 'my' }") My posts

	.postForm(v-if="showForm")
		vue-form-generator(:schema='schema', :model='model', :options='{}', :multiple="false", v-ref:form, :is-new-model="isNewPost")

		.buttons
			button.save(@click="savePost") Save
			button.cancel(@click="cancelPost") Cancel


	ul.posts
		li(v-for="post in rows")
			.image
				img(:src="post.author.gravatar")
				.votes
					.count {{ post.votes }}
					.thumb.up(@click="upVote(post)")
						i.fa.fa-thumbs-o-up
					.thumb.down(@click="downVote(post)")
						i.fa.fa-thumbs-o-down
			.container
				.title {{ post.title }}
				.content {{ post.content }}
				.footer
					.views.badge Views: {{ post.views }}
					.createdBy Created {{ post.createdAt | ago }} by {{ post.author.fullName }}


</template>

<script>
	import Vue from "vue";
	import toast from "../../core/toastr";
	import { validators, schema as schemaUtils } from "vue-form-generator";

	import MixinsIO from "../../core/mixins/io";

	/*import gql from 'graphql-tag';
	window['gql'] = gql;

	import ApolloClient, { createNetworkInterface } from "apollo-client";*/

	import * as actions from "./vuex/actions";
	import * as getters from "./vuex/getters";

	export default {
		/**
		 * Create websocket connection to '/posts' namespace
		 */
		mixins: [ MixinsIO("/posts") ],

		/**
		 * Set page schema as data property
		 */
		data() {
			return {
				sort: "hot",
				viewMode: "all",

				showForm: false,
				isNewPost: false,
				model: null,
				schema: {
					fields: [
						{
							type: "text",
							label: "Title",
							model: "title",
							featured: true,
							required: true,
							placeholder: "Title of post",
							validator: validators.string
						},				
						{
							type: "textArea",
							label: "Content",
							model: "content",
							featured: true,
							required: true,
							rows: 4,
							placeholder: "Content of post",
							validator: validators.string
						}
					]
				}
			};
		},

		/**
		 * Set Vuex actions & getters
		 */
		vuex: {
			getters,
			actions
		},		

		/**
		 * Route handlers
		 */
		route: {
			activate() {

			},

			data(transition) {
				
			}
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		sockets: {

			/**
			 * New device added
			 * @param  {Object} row Device object
			 */
			new(row) {
				console.log("New post: ", row);
				this.rowAdded(row);

				toast.success(`Post '${row.name}' added!`, "Post added");
			},

			/**
			 * Post updated
			 * @param  {Object} row Post object
			 */
			update(row) {
				console.log("Update post: ", row);
				this.rowChanged(row);

				toast.success(`Post '${row.name}' updated!`, "Post updated");
			},

			/**
			 * Post removed
			 * @param  {Object} row Post object
			 */
			remove(row) {
				console.log("Remove post: ", row);
				this.rowRemoved(row);	

				toast.success(`Post '${row.name}' deleted!`, "Post deleted");
			}
		},	

		methods: {
			getPosts() {
				// Download rows for the page
				this.downloadRows(this.viewMode, this.sort);
			},

			setSort(sort) {
				this.sort = sort;
				this.getPosts();
			},

			setViewMode(mode) {
				this.viewMode = mode;
				this.getPosts();
			},

			newPost() {
				this.model = schemaUtils.createDefaultObject(this.schema);
				this.showForm = true;
				this.isNewPost = true;

				this.$nextTick(() => {
					let el = document.querySelector("div.form input:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});				
			},

			savePost() {
				if (this.$refs.form.validate()) {
					if (this.isNewPost)
						this.saveRow(this.model);
					else
						this.updateRow(this.model);

					this.cancelPost();
				}
			},

			cancelPost() {
				this.showForm = false;
				this.model = null;
			}


		},

		/**
		 * Call if the component is created
		 */
		created() {
			this.getPosts();
			/*
			const networkInterface = createNetworkInterface('/graphql');

			networkInterface.use([{
				applyMiddleware(req, next) {
					// Send to back the session ID
					req.options.credentials = "same-origin";
					next();
				}
			}]);

			let client = new ApolloClient({
				networkInterface
			});

			client.query({
				query: gql`
					query getDevice($deviceID: Int!) { 
						device(id: $deviceID) {
							code
							name
							description
							address
							type
							status
							lastCommunication
						}
					}
				`, 
				variables: {
					deviceID: 22
				},
				forceFetch: false
			}).then( (result) => {
				if (result.errors)
					return console.error("Got some GraphQL execution errors!", result.errors);

				if (result.data) {
					console.log(result.data);
				}
			}).catch( (error) => {
				console.error("There was an error sending the query", error);
			});*/
		}
	};
</script>

<style lang="sass" scoped>

	@import "../../../scss/variables";
	@import "../../../scss/mixins";

	.header {

		.sort, .filter {
			float: left;
			cursor: pointer;

			> {
				display: inline-block;
				margin: 0.3rem 1rem;
			}		
		}

		.add {
			float: left;
		}

		.filter {
			float: right;
		}

		@include clearfix();

	} // .header

	.postForm {

		background-color: #EEE;
		color: Black;

		margin: 1rem;

		.buttons {
			padding: 0.5em;
			text-align: right;
		}

	} // .postForm

	.badge {
		padding: 2px 8px;
		background-color: $color2;
		margin: 0 4px;
		border-radius: 4px;
	}

	ul.posts {
		margin: 1rem 3rem;
		padding: 0;
		list-style: none;

		li {
			position: relative;
			margin: 1.0rem 0;
			padding: 0.5rem 0.5rem;
			font-size: 1.1rem;

			&:hover {
				background-color: rgba($color2, 0.4);
				border-radius: 8px;				
			}

			display: flex;

			.image {
				width: 64px;
				margin-right: 1rem;
				margin-top: 0.5rem;

				.votes {

					.count {
						font-size: 3.0em;
						text-align: center;
						font-family: $fontFamilyHeader;
						font-weight: 300;
					}

					.thumb {
						display: inline-block;
						cursor: pointer;
						margin: 0 8px;
						font-size: 1.2em;

						&:hover {
							color: $headerTextColor;
						}

					}

				} // .votes

			} // .image
			
			.container {
				flex: 1;

				.title {
					color: $headerTextColor;
					font-family: $fontFamilyHeader;
					font-weight: 300;
					font-size: 1.8em;
					margin-bottom: 0.5rem;
				}

				.content {
				}

				.footer {
					margin-top: 1.0em;
					font-size: 0.7em;

					.createdBy {
						float: right;
						color: $color3;
					}

					.votes {
						float: left;
					}

					.views {
						float: left;
					}

					@include clearfix;
				}

			}



		}
	}

</style>