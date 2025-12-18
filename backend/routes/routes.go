package routes

import (
	"net/http"
	"nova-ia-api/handlers"
	customMiddleware "nova-ia-api/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// SetupRouter configura todas as rotas da aplicação
func SetupRouter() *chi.Mux {
	r := chi.NewRouter()

	// Middlewares globais
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(customMiddleware.CORS)

	// Rotas públicas
	r.Get("/", handlers.Home)
	r.Get("/health", handlers.Health)

	// Rotas da API (todas com prefixo /api)
	r.Route("/api", func(r chi.Router) {
		// Rotas de usuários (admin-only)
		r.Route("/users", func(r chi.Router) {
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Get("/", handlers.GetUsers)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Post("/", handlers.CreateUser)
			r.With(customMiddleware.RequireAuth, customMiddleware.RequireRole("admin")).
				Get("/{id}", handlers.GetUser)
		})

		// User Groups (autenticado - qualquer role)
		r.With(customMiddleware.RequireAuth).
			Get("/cognito-user-group", handlers.GetUserGroups)

		// Models (autenticado - qualquer role)
		r.With(customMiddleware.RequireAuth).
			Get("/models", handlers.GetModels)

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
