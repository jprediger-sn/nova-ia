package utils

import (
	"context"
	"net/http"

	"nova-ia-api/models"
)

const (
	// Context keys para armazenar dados do usuário autenticado
	userClaimsKey = "user_claims"
	tenantIDKey   = "tenant_id"
	userRoleKey   = "user_role"
)

// SetUserClaims adiciona os claims do usuário ao contexto da requisição
func SetUserClaims(r *http.Request, claims *models.UserClaims) {
	ctx := r.Context()
	ctx = context.WithValue(ctx, userClaimsKey, claims)
	ctx = context.WithValue(ctx, tenantIDKey, claims.TenantID)
	ctx = context.WithValue(ctx, userRoleKey, claims.Role)
	*r = *r.WithContext(ctx)
}

// GetUserClaims retorna os claims do usuário do contexto
func GetUserClaims(r *http.Request) *models.UserClaims {
	if claims, ok := r.Context().Value(userClaimsKey).(*models.UserClaims); ok {
		return claims
	}
	return nil
}

// GetTenantID retorna o tenant_id do contexto
func GetTenantID(r *http.Request) string {
	if tenantID, ok := r.Context().Value(tenantIDKey).(string); ok {
		return tenantID
	}
	return ""
}

// GetUserRole retorna a role do usuário do contexto
func GetUserRole(r *http.Request) string {
	if role, ok := r.Context().Value(userRoleKey).(string); ok {
		return role
	}
	return ""
}

// GetUserClaimsMap retorna os claims como mapa (para compatibilidade)
func GetUserClaimsMap(r *http.Request) map[string]interface{} {
	claims := GetUserClaims(r)
	if claims == nil {
		return nil
	}
	return map[string]interface{}{
		"sub":            claims.Sub,
		"email":          claims.Email,
		"custom:tenant_id": claims.TenantID,
		"custom:role":    claims.Role,
	}
}

