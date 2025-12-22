package models

// Response representa a estrutura padrão de resposta da API
type Response struct {
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Details string      `json:"details,omitempty"`
	Code    string      `json:"code,omitempty"`
}
