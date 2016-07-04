<template lang="jade">
	h3 Posts

	.header
		.sort
			a(@click="setSort('hot')", :class="{ active: sort == 'hot' }") Hot
			a(@click="setSort('mostviewed')", :class="{ active: sort == 'mostviewed' }") Most viewed
			a(@click="setSort('new')", :class="{ active: sort == 'new' }") New

		.filter 
			a(@click="setViewMode('all')", :class="{ active: viewMode == 'all' }") All posts
			a(@click="setViewMode('my')", :class="{ active: viewMode == 'my' }") My posts

	ul.posts
		li(v-for="post in rows")
			.image
				img(:src="post.author.gravatar")
				.votes
					.up(@click="upVote(post)")
						i.fa.fa-thumbs-o-up
					.down(@click="downVote(post)")
						i.fa.fa-thumbs-o-down
			.container
				.title {{ post.title }}
				.content {{ post.content }}
				.footer
					.votes.badge Votes: {{ post.votes }}
					.views.badge Views: {{ post.views }}
					.createdBy Created {{ post.createdAt | ago }} by {{ post.author.fullName }}


</template>

<script>
	import Vue from "vue";
	import toast from "../../core/toastr";

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
				viewMode: "all"
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

		.filter {
			float: right;
		}

		@include clearfix();

	} // .header

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
				width: 80px;
				margin-top: 0.5rem;

				.votes {

					> div {
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