package routes

import (
	"net/http"
	"nova-ia-api/handlers"
	customMiddleware "nova-ia-api/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	_ "nova-ia-api/docs"

	httpSwagger "github.com/swaggo/http-swagger"
)

// SetupRouter configura todas as rotas da aplicação
func SetupRouter() *chi.Mux {
	r := chi.NewRouter()

	// Middlewares globais
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(customMiddleware.CORS)

	// Rota para o Swagger UI
	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))

	// Rotas públicas
	r.Get("/", handlers.Home)
	r.Get("/health", handlers.Health)

	// Rotas da API (todas com prefixo /api)
	r.Route("/api", func(r chi.Router) {
		// Rotas de usuários (admin-only)
		r.Route("/users", func(r chi.Router) {
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Get("/", handlers.ListUsers)
			r.With(customMiddleware.RequireAuth).
				Post("/", handlers.CreateUser)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Get("/{username}", handlers.GetUser)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Put("/{username}", handlers.UpdateUser)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Delete("/{username}", handlers.DeleteUser)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Post("/{username}/enable", handlers.EnableUser)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Post("/{username}/disable", handlers.DisableUser)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Post("/{username}/reset-password", handlers.ResetUserPassword)
		})

		// Tenants (admin-only)
		r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
			Get("/tenants", handlers.ListTenants)

		// User Groups (autenticado - qualquer role)
		r.With(customMiddleware.RequireAuth).
			Get("/cognito-user-group", handlers.GetUserGroups)

		// Models (CRUD) - autenticado - qualquer role
		r.Route("/models", func(r chi.Router) {
			r.With(customMiddleware.RequireAuth).
				Get("/", handlers.ListModels)
			r.With(customMiddleware.RequireAuth).
				Get("/{id}", handlers.GetModel)
			r.With(customMiddleware.RequireAuth).
				Post("/", handlers.CreateModel)
			r.With(customMiddleware.RequireAuth).
				Put("/{id}", handlers.UpdateModel)
			r.With(customMiddleware.RequireAuth).
				Delete("/{id}", handlers.DeleteModel)
		})

		// Chunks (CRUD) - manager+ para write, autenticado para read
		r.Route("/chunks", func(r chi.Router) {
			r.With(customMiddleware.RequireAuth).
				Get("/", handlers.ListChunks)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/", handlers.CreateChunk)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Put("/", handlers.UpdateChunk)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Delete("/", handlers.DeleteChunk)
		})

		// Merge (manager+)
		r.Route("/merge", func(r chi.Router) {
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/preview", handlers.GetChunksMerge)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/apply", handlers.CommitChunksMerge)
		})

		// Modify (manager+)
		r.Route("/modify", func(r chi.Router) {
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/send", handlers.SendTextModify)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Get("/check", handlers.CheckTextModify)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/apply", handlers.ApplyTextModify)
		})

		// Conversacional (manager+)
		r.Route("/conversacional", func(r chi.Router) {
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/", handlers.ProcessResponse)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/webhook", handlers.GetWebhookResponse)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/check-status", handlers.GetMessageStatus)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin", "manager")).
				Post("/batch", handlers.GetBatchResponse)
		})

		// Embeddings (autenticado - qualquer role)
		r.With(customMiddleware.RequireAuth).
			Post("/embeddings", handlers.GetEmbeddings)
	})

	// Handler para rotas não encontradas (404)
	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		handlers.NotFound(w, r)
	})

	return r
}
