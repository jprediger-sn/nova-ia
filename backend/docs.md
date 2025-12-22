# nova-ia-api

Documentação da API Nova IA

## Routes

<details>
<summary>`/`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/**
	- _GET_
		- [Home]()

</details>
<details>
<summary>`/api/chunks`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/chunks**
		- **/**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.2.RequireRole.1]()
				- [CreateChunk]()
			- _PUT_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.2.RequireRole.2]()
				- [UpdateChunk]()
			- _DELETE_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.2.RequireRole.3]()
				- [DeleteChunk]()
			- _GET_
				- [RequireAuth]()
				- [ListChunks]()

</details>
<details>
<summary>`/api/cognito-user-group`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/cognito-user-group**
		- _GET_
			- [RequireAuth]()
			- [GetUserGroups]()

</details>
<details>
<summary>`/api/conversacional`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/conversacional**
		- **/**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.5.RequireRole.1]()
				- [ProcessResponse]()

</details>
<details>
<summary>`/api/conversacional/batch`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/conversacional**
		- **/batch**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.5.RequireRole.4]()
				- [GetBatchResponse]()

</details>
<details>
<summary>`/api/conversacional/check-status`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/conversacional**
		- **/check-status**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.5.RequireRole.3]()
				- [GetMessageStatus]()

</details>
<details>
<summary>`/api/conversacional/webhook`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/conversacional**
		- **/webhook**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.5.RequireRole.2]()
				- [GetWebhookResponse]()

</details>
<details>
<summary>`/api/embeddings`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/embeddings**
		- _POST_
			- [RequireAuth]()
			- [GetEmbeddings]()

</details>
<details>
<summary>`/api/merge/apply`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/merge**
		- **/apply**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.3.RequireRole.2]()
				- [CommitChunksMerge]()

</details>
<details>
<summary>`/api/merge/preview`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/merge**
		- **/preview**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.3.RequireRole.1]()
				- [GetChunksMerge]()

</details>
<details>
<summary>`/api/models`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/models**
		- _GET_
			- [RequireAuth]()
			- [GetModels]()

</details>
<details>
<summary>`/api/modify/apply`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/modify**
		- **/apply**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.4.RequireRole.3]()
				- [ApplyTextModify]()

</details>
<details>
<summary>`/api/modify/check`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/modify**
		- **/check**
			- _GET_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.4.RequireRole.2]()
				- [CheckTextModify]()

</details>
<details>
<summary>`/api/modify/send`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/modify**
		- **/send**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.4.RequireRole.1]()
				- [SendTextModify]()

</details>
<details>
<summary>`/api/tenants`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/tenants**
		- _GET_
			- [RequireAuth]()
			- [nova-ia-api/routes.SetupRouter.func1.RequireRole.6]()
			- [ListTenants]()

</details>
<details>
<summary>`/api/users`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/users**
		- **/**
			- _GET_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.1.RequireRole.1]()
				- [ListUsers]()
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.1.RequireRole.2]()
				- [CreateUser]()

</details>
<details>
<summary>`/api/users/{username}`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/users**
		- **/{username}**
			- _DELETE_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.1.RequireRole.5]()
				- [DeleteUser]()
			- _GET_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.1.RequireRole.3]()
				- [GetUser]()
			- _PUT_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.1.RequireRole.4]()
				- [UpdateUser]()

</details>
<details>
<summary>`/api/users/{username}/disable`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/users**
		- **/{username}/disable**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.1.RequireRole.7]()
				- [DisableUser]()

</details>
<details>
<summary>`/api/users/{username}/enable`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/users**
		- **/{username}/enable**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.1.RequireRole.6]()
				- [EnableUser]()

</details>
<details>
<summary>`/api/users/{username}/reset-password`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/api**
	- **/users**
		- **/{username}/reset-password**
			- _POST_
				- [RequireAuth]()
				- [nova-ia-api/routes.SetupRouter.func1.1.RequireRole.8]()
				- [ResetUserPassword]()

</details>
<details>
<summary>`/health`</summary>

- [Logger]()
- [Recoverer]()
- [CORS]()
- **/health**
	- _GET_
		- [Health]()

</details>

Total # of routes: 21
