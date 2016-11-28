# Services

## Service properties
Property        | Description                 
----------------| --------------------------- 
`settings` 		| Settings of service 
`actions` 		| Public actions of service 
`methods` 		| Public methods of service 
`init` 			| Event handler when the service initialized 
`ownerChecker`	| Method to check the owner of the model 
`socket`		| Websocket settings 
`graphql`		| GraphQL type definitions and resolvers 

## Service settings
Property       		| Type     | Default        	| Description                 
------------------- | -------- | ------------------ | ----------------------------
`name`				| String | `null`				| Name of the service 
`version`			| Number | `1`					| Version of the service. Will be created a versioned path too: `/api/v1/...` 
`namespace`			| String | `""`					| Namespace of the service. We use it in the path: `/api/posts` and `/api/v1/posts` 
`internal`			| Boolean | `false`				| Is it an internal service (we don't accept requests from HTTP/WS) 
`rest`				| Boolean | `false`				| Publish actions of service via HTTP REST API 
`ws`				| Boolean | `false`				| Publish actions of service via Websocket
`graphql`			| Boolean | `false`				| Publish actions of service via GraphQL
`permission`		| String | `C.PERM_LOGGEDIN`	| Base permission to access the actions
`role`				| String | `C.ROLE_USER`		| Base role to access the actions
`collection`		| MongoCollection | `null`		| Used collection of the service.
`idParamName`		| String | `"code"`				| Parameter name of the ID field in requests. `/api/posts?code=123`
`modelPropFilter`	| String | `null`				| You can filter the properties in the response JSON. It can be an array with field names or a space-separated string. If empty or `null`, will be expose all properties of the models
`modelPopulates`	| Object | `null`				| Populate schema. The `populateModels` use it to populate the joined fields. It is a key-value pair object.

## toJSON

## Populates

## Permission

## Model resolving

## Actions

## Methods

## REST interface

## Socket.io interface

## GraphQL interface



## Example

Example service to handle `posts` collection from DB. 
```js
{
	settings: {
		name: "posts",
		version: 1,
		namespace: "posts",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Post,

		modelPropFilter: "code title content author votes voters views createdAt updatedAt",
		
		modelPopulates: {
			"author": "persons",
			"voters": "persons"
		}
	},

	actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {};

				if (ctx.params.filter == "my") 
					filter.author = ctx.user.id;
				else if (ctx.params.author != null) { 
					filter.author = this.personService.decodeID(ctx.params.author);
				}

				let query = Post.find(filter);

				return ctx.queryPageSort(query).exec().then( (docs) => {
					return this.toJSON(docs);
				})
				.then((json) => {
					return this.populateModels(json);
				});
			}
		},

		// return a model by ID
		get: {
			cache: true, // if true, we don't increment the views!
			permission: C.PERM_PUBLIC,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

				return Post.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } }).exec().then( (doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				});
			}
		},

		create: {
			handler(ctx) {
				this.validateParams(ctx, true);

				let post = new Post({
					title: ctx.params.title,
					content: ctx.params.content,
					author: ctx.user.id
				});

				return post.save()
				.then((doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "created", json);
					return json;
				});								
			}
		},

		update: {
			permission: C.PERM_OWNER,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:PostNotFound"));
				this.validateParams(ctx);

				return this.collection.findById(ctx.modelID).exec()
				.then((doc) => {
					if (ctx.params.title != null)
						doc.title = ctx.params.title;

					if (ctx.params.content != null)
						doc.content = ctx.params.content;

					return doc.save();
				})
				.then((doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "updated", json);
					return json;
				});								
			}
		},

		remove: {
			permission: C.PERM_OWNER,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

				return Post.remove({ _id: ctx.modelID })
				.then(() => {
					return ctx.model;
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "removed", json);
					return json;
				});		
			}
		},

		vote(ctx) {
			ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {		
				// Check user is on voters
				if (doc.voters.indexOf(ctx.user.id) !== -1) 
					throw ctx.errorBadRequest(C.ERR_ALREADY_VOTED, ctx.t("app:YouHaveAlreadyVotedThisPost"));
				return doc;
			})
			.then((doc) => {
				// Add user to voters
				return Post.findByIdAndUpdate(doc.id, { $addToSet: { voters: ctx.user.id } , $inc: { votes: 1 }}, { "new": true });
			})
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "voted", json);
				return json;
			});
		},

		unvote(ctx) {
			ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

			return this.collection.findById(ctx.modelID).exec()
			.then((doc) => {
				// Check user is on voters
				if (doc.voters.indexOf(ctx.user.id) == -1) 
					throw ctx.errorBadRequest(C.ERR_NOT_VOTED_YET, ctx.t("app:YouHaveNotVotedThisPostYet"));
				return doc;
			})
			.then((doc) => {
				// Remove user from voters
				return Post.findByIdAndUpdate(doc.id, { $pull: { voters: ctx.user.id } , $inc: { votes: -1 }}, { "new": true });
			})
			.then((doc) => {
				return this.toJSON(doc);
			})
			.then((json) => {
				return this.populateModels(json);
			})
			.then((json) => {
				this.notifyModelChanges(ctx, "unvoted", json);
				return json;
			});

		}

	},

	methods: {
		/**
		 * Validate params of context.
		 * We will call it in `create` and `update` actions
		 * 
		 * @param {Context} ctx 			context of request
		 * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
		 */
		validateParams(ctx, strictMode) {
			if (strictMode || ctx.hasParam("title"))
				ctx.validateParam("title").trim().notEmpty(ctx.t("app:PostTitleCannotBeEmpty")).end();

			if (strictMode || ctx.hasParam("content"))
				ctx.validateParam("content").trim().notEmpty(ctx.t("app:PostContentCannotBeEmpty")).end();
			
			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}

	},

	/**
	 * Check the owner of model
	 * 
	 * @param {any} ctx	Context of request
	 * @returns	{Promise}
	 */
	ownerChecker(ctx) {
		return new Promise((resolve, reject) => {
			ctx.assertModelIsExist(ctx.t("app:PostNotFound"));

			if (ctx.model.author.code == ctx.user.code || ctx.isAdmin()) 
				resolve();
			else
				reject();
		});
	},

	// Fired when start the service
	init(ctx) {
		this.personService = ctx.services("persons");
 
		// Add custom error types
		C.append([
			"ALREADY_VOTED",
			"NOT_VOTED_YET"
		], "ERR");
	},

	socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	},

	graphql: {

		query: `
			posts(limit: Int, offset: Int, sort: String): [Post]
			post(code: String): Post
		`,

		types: `
			type Post {
				code: String!
				title: String
				content: String
				author: Person!
				views: Int
				votes: Int,
				voters(limit: Int, offset: Int, sort: String): [Person]
				createdAt: Timestamp
				updatedAt: Timestamp
			}
		`,

		mutation: `
			postCreate(title: String!, content: String!): Post
			postUpdate(code: String!, title: String, content: String): Post
			postRemove(code: String!): Post

			postVote(code: String!): Post
			postUnvote(code: String!): Post
		`,

		resolvers: {
			Query: {
				posts: "find",
				post: "get"
			},

			Mutation: {
				postCreate: "create",
				postUpdate: "update",
				postRemove: "remove",
				postVote: "vote",
				postUnvote: "unvote"
			}
		}
	}

};

```