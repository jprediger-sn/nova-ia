package models

import "time"

// Model representa um modelo na tabela models
type Model struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	TenantID  *string    `json:"tenant_id,omitempty"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
}

// CreateModelRequest representa a requisição para criar um modelo
type CreateModelRequest struct {
	Name     string  `json:"name"`
	TenantID *string `json:"tenant_id,omitempty"`
}

// UpdateModelRequest representa a requisição para atualizar um modelo
type UpdateModelRequest struct {
	Name     *string `json:"name,omitempty"`
	TenantID *string `json:"tenant_id,omitempty"`
}
