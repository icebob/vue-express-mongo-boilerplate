<template lang="jade">
	.container
		h2.title {{ _('Posts') }}

		.level
			.level-left.control.has-addons
				a(@click="setSort('hot')", :class="{ active: sort == 'hot' }") {{ _("Hot") }}
				a(@click="setSort('mostviewed')", :class="{ active: sort == 'mostviewed' }") {{ _("MostViewed") }}
				a(@click="setSort('new')", :class="{ active: sort == 'new' }") {{ _("New") }}

				button.button.primary(@click="newPost")
					span.icon
						i.fa.fa-plus
					span {{ _("NewPost") }}

			.level-right.control.has-addons
				a(@click="setViewMode('all')", :class="{ active: viewMode == 'all' }") {{ _("AllPosts") }}
				a(@click="setViewMode('my')", :class="{ active: viewMode == 'my' }") {{ _("MyPosts") }}

		.postForm(v-if="showForm")
			vue-form-generator(:schema='schema', :model='model', :options='{}', :multiple="false", v-ref:form, :is-new-model="isNewPost")

			.control.is-grouped
				button.control.button.is-primary(@click="savePost") {{ _("Save") }}
				button.control.button(@click="cancelPost") {{ _("Cancel") }}


		ul.posts
			li(v-for="post of rows | orderBy orderPosts -1", transition="post", track-by="code")
				.box
					article.media
						.media-left
							figure.image.is-64x64
								img(:src="post.author.gravatar")

							.votes
								.count.has-text-centered {{ post.votes }}
								.thumb.up(@click="upVote(post)")
									i.fa.fa-thumbs-o-up
								.thumb.down(@click="downVote(post)")
									i.fa.fa-thumbs-o-down
						.media-content
							.content
								.title 
									span {{ post.title }}

								p.content(v-html="post.content | marked")
							nav.level
								.level-left
									a.level-item(:title="_('EditPost')", @click="editPost(post)")
										span.icon.is-small
											i.fa.fa-pencil
									a.level-item(:title="_('DeletePost')", @click="deletePost(post)")
										span.icon.is-small
											i.fa.fa-trash
								.level-right
									.level-item
										small {{ ago(post) }}

</template>

<script>
	import Vue from "vue";
	import marked from "marked";
	import toast from "../../core/toastr";
	import { cloneDeep } from "lodash";
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

		filters: {
			marked
		},

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
							label: this._("Title"),
							model: "title",
							featured: true,
							required: true,
							placeholder: this._("TitleOfPost"),
							validator: validators.string
						},				
						{
							type: "textArea",
							label: this._("Content"),
							model: "content",
							featured: true,
							required: true,
							rows: 10,
							placeholder: this._("ContentOfPost"),
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

				toast.success(this._("PostNameAdded", row), this._("PostAdded"));
			},

			/**
			 * Post updated
			 * @param  {Object} row Post object
			 */
			update(row) {
				console.log("Update post: ", row);
				this.rowChanged(row);

				toast.success(this._("PostNameUpdated", row), this._("PostUpdated"));
			},

			/**
			 * Post removed
			 * @param  {Object} row Post object
			 */
			remove(row) {
				console.log("Remove post: ", row);
				this.rowRemoved(row);	

				toast.success(this._("PostNameDeleted", row), this._("PostDeleted"));
			}
		},	

		methods: {
			orderPosts(a, b) {
				switch(this.sort) {
				case "hot": return a.votes - b.votes;
				case "mostviewed": return a.views - b.views;
				case "new": return a.createdAt - b.createdAt;
				}
			},

			ago(post) {
				return this._("CreatedAgoByName", { ago: Vue.filter("ago")(post.createdAt), name: post.author.fullName } );
			},

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

				this.focusFirstInput();
			},

			editPost(post) {
				this.model = cloneDeep(post);
				this.showForm = true;
				this.isNewPost = false;
				this.focusFirstInput();
			},

			focusFirstInput() {
				this.$nextTick(() => {
					let el = document.querySelector(".postForm .form-control:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			},

			focusFirstErrorInput() {
				this.$nextTick(() => {
					let el = document.querySelector(".postForm .form-group.error .form-control");
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
				} else {
					this.focusFirstErrorInput();
				}
			},

			cancelPost() {
				this.showForm = false;
				this.model = null;
			},

			deletePost(post) {
				this.removeRow(post);
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

	@import "../../../scss/themes/blurred/variables";
	@import "../../../scss/common/mixins";

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

			.votes {

				.count {
					font-weight: 300;
					font-size: 3.0rem;
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

		}
	}


	/* Transition styles */

	.post-transition {
		transition: opacity .5s ease;
	}

	.post-enter {
		opacity: 0;
	}

	.post-leave {
		opacity: 0;
		position: absolute !important; /* important for removal move to work */
	}

	.post-move {
		transition: transform .5s cubic-bezier(.55,0,.1,1);
	}



</style>