package models

import "time"

// User representa um usuário do Cognito
type User struct {
	Username     string     `json:"username"`
	Email        *string    `json:"email,omitempty"`
	Name         *string    `json:"name,omitempty"`
	TenantID     *string    `json:"tenant_id,omitempty"`
	Role         *string    `json:"role,omitempty"`
	Status       string     `json:"status"`
	Enabled      bool       `json:"enabled"`
	CreatedAt    *time.Time `json:"created_at,omitempty"`
	LastModified *time.Time `json:"last_modified,omitempty"`
}

// CreateUserRequest representa a requisição para criar um usuário
type CreateUserRequest struct {
	Email             string  `json:"email"`
	Name              *string `json:"name,omitempty"`
	TenantID          *string `json:"tenant_id,omitempty"`
	Role              *string `json:"role,omitempty"`
	TemporaryPassword *string `json:"temporary_password,omitempty"`
}

// UpdateUserRequest representa a requisição para atualizar um usuário
type UpdateUserRequest struct {
	TenantID *string `json:"tenant_id,omitempty"`
	Role     *string `json:"role,omitempty"`
	Name     *string `json:"name,omitempty"`
}

// ListUsersResponse representa a resposta de listagem de usuários
type ListUsersResponse struct {
	Message string `json:"message"`
	Data    []User `json:"data"`
	Total   int    `json:"total"`
}

// UserResponse representa a resposta de um único usuário
type UserResponse struct {
	Message string `json:"message"`
	Data    User   `json:"data"`
}

// ErrorResponse representa uma resposta de erro padronizada
type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
	Code    string `json:"code"`
}
