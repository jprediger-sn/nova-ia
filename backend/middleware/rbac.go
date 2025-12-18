package middleware

import (
	"net/http"

	"nova-ia-api/utils"
)

// RequireRole middleware que valida se o usuário tem uma das roles especificadas
// Retorna uma função que cria um middleware com as roles especificadas
func RequireRole(roles ...string) func(http.Handler) http.Handler {
	// Esta função retornada é o middleware que o chi espera
	return func(next http.Handler) http.Handler {
		// Este é o handler HTTP final que será executado
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userRole := utils.GetUserRole(r)

			if userRole == "" {
				utils.JSONError(w, http.StatusUnauthorized, "Unauthorized: User role not found")
				return
			}

			// Verifica se o usuário tem uma das roles permitidas
			hasRole := false
			for _, role := range roles {
				if userRole == role {
					hasRole = true
					break
				}
			}

			if !hasRole {
				utils.JSONError(w, http.StatusForbidden, "Forbidden: Insufficient permissions")
				return
			}

			// Se passou na validação, chama o próximo handler
			next.ServeHTTP(w, r)
		})
	}
}
