package middleware

import (
	"log"
	"net/http"
	"sort"
	"strings"

	"nova-ia-api/models"
	"nova-ia-api/utils"
)

func listClaimHeaderKeys(r *http.Request) []string {
	keys := make([]string, 0)
	for k := range r.Header {
		if strings.HasPrefix(strings.ToLower(k), strings.ToLower("X-Claim-")) {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)
	return keys
}

// RequireAuth middleware que valida autenticação e extrai claims do JWT
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extrai claims dos headers (adicionados pelo lambda.go)
		claims := extractClaimsFromHeaders(r)

		if claims == nil {
			log.Printf(
				"auth: requireAuth failed reason=no-claims method=%s path=%q hasAuthz=%t claimHeaderKeys=%v",
				r.Method,
				r.URL.Path,
				r.Header.Get("Authorization") != "",
				listClaimHeaderKeys(r),
			)
			utils.JSONError(w, http.StatusUnauthorized, "Unauthorized: Invalid or missing authentication")
			return
		}

		// Valida se tenant_id e role estão presentes
		if claims.TenantID == "" {
			log.Printf(
				"auth: requireAuth failed reason=missing-tenant method=%s path=%q sub=%q role=%q claimHeaderKeys=%v",
				r.Method,
				r.URL.Path,
				claims.Sub,
				claims.Role,
				listClaimHeaderKeys(r),
			)
			utils.JSONError(w, http.StatusUnauthorized, "Unauthorized: Missing tenant_id")
			return
		}

		if claims.Role == "" {
			log.Printf(
				"auth: requireAuth failed reason=missing-role method=%s path=%q sub=%q tenant=%q claimHeaderKeys=%v",
				r.Method,
				r.URL.Path,
				claims.Sub,
				claims.TenantID,
				listClaimHeaderKeys(r),
			)
			utils.JSONError(w, http.StatusUnauthorized, "Unauthorized: Missing role")
			return
		}

		// Adiciona claims ao contexto da requisição
		utils.SetUserClaims(r, claims)

		next.ServeHTTP(w, r)
	})
}

// extractClaimsFromHeaders extrai claims JWT dos headers customizados
// (adicionados pelo lambda.go quando API Gateway valida o JWT)
func extractClaimsFromHeaders(r *http.Request) *models.UserClaims {
	claims := &models.UserClaims{}

	// Extrai sub
	if sub := r.Header.Get("X-Claim-sub"); sub != "" {
		claims.Sub = sub
	}

	// Extrai email
	if email := r.Header.Get("X-Claim-email"); email != "" {
		claims.Email = email
	}

	// Extrai custom:tenant_id
	if tenantID := r.Header.Get("X-Claim-custom:tenant_id"); tenantID != "" {
		claims.TenantID = tenantID
	}

	// Extrai custom:role
	if role := r.Header.Get("X-Claim-custom:role"); role != "" {
		claims.Role = role
	}

	// Se não tem pelo menos sub, retorna nil (não autenticado)
	if claims.Sub == "" {
		return nil
	}

	return claims
}
