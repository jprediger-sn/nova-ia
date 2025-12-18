package models

// UserClaims representa os claims do JWT do usuário autenticado
type UserClaims struct {
	Sub      string `json:"sub"`
	Email    string `json:"email"`
	TenantID string `json:"custom:tenant_id"`
	Role     string `json:"custom:role"`
}

// IsAdmin verifica se o usuário tem role de admin
func (uc *UserClaims) IsAdmin() bool {
	return uc.Role == "admin"
}

// IsManager verifica se o usuário tem role de manager ou admin
func (uc *UserClaims) IsManager() bool {
	return uc.Role == "manager" || uc.Role == "admin"
}

// HasRole verifica se o usuário tem uma das roles especificadas
func (uc *UserClaims) HasRole(roles ...string) bool {
	for _, role := range roles {
		if uc.Role == role {
			return true
		}
	}
	return false
}

