package handlers

import (
	"encoding/json"
	"net/http"

	"nova-ia-api/models"
	"nova-ia-api/utils"
)

// GetChunksMerge retorna preview do merge de chunks
func GetChunksMerge(w http.ResponseWriter, r *http.Request) {
	var request map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	// TODO: Implementar lógica de getChunksMerge do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Get chunks merge preview endpoint - to be implemented",
		Data:    request,
	})
}

// CommitChunksMerge aplica o merge de chunks
func CommitChunksMerge(w http.ResponseWriter, r *http.Request) {
	var request map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	// TODO: Implementar lógica de commitChunksMerge do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Commit chunks merge endpoint - to be implemented",
		Data:    request,
	})
}

