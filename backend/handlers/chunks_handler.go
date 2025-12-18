package handlers

import (
	"encoding/json"
	"net/http"

	"nova-ia-api/models"
	"nova-ia-api/utils"
)

// ListChunks retorna a lista de chunks filtrados por tenant_id
func ListChunks(w http.ResponseWriter, r *http.Request) {
	// Extrai tenant_id do contexto (adicionado pelo middleware de autenticação)
	tenantID := utils.GetTenantID(r)
	userRole := utils.GetUserRole(r)

	// TODO: Implementar lógica de list do controller JavaScript
	// Filtrar chunks pelo tenant_id
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "List chunks endpoint - to be implemented",
		Data: map[string]interface{}{
			"tenant_id": tenantID,
			"role":      userRole,
		},
	})
}

// CreateChunk cria um novo chunk associado ao tenant_id do usuário
func CreateChunk(w http.ResponseWriter, r *http.Request) {
	var chunk map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&chunk); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Extrai tenant_id do contexto e associa ao chunk
	tenantID := utils.GetTenantID(r)
	if chunk == nil {
		chunk = make(map[string]interface{})
	}
	chunk["tenant_id"] = tenantID

	// TODO: Implementar lógica de create do controller JavaScript
	utils.JSONResponse(w, http.StatusCreated, models.Response{
		Message: "Create chunk endpoint - to be implemented",
		Data:    chunk,
	})
}

// UpdateChunk atualiza um chunk existente
func UpdateChunk(w http.ResponseWriter, r *http.Request) {
	var chunk map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&chunk); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	// TODO: Implementar lógica de update do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Update chunk endpoint - to be implemented",
		Data:    chunk,
	})
}

// DeleteChunk remove um chunk
func DeleteChunk(w http.ResponseWriter, r *http.Request) {
	var chunk map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&chunk); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	// TODO: Implementar lógica de remove do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Delete chunk endpoint - to be implemented",
		Data:    chunk,
	})
}
