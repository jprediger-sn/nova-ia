package handlers

import (
	"encoding/json"
	"net/http"

	"nova-ia-api/models"
	"nova-ia-api/utils"
)

// GetEmbeddings retorna embeddings para o texto fornecido
func GetEmbeddings(w http.ResponseWriter, r *http.Request) {
	var request map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	// TODO: Implementar lógica de getEmbeddings do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Get embeddings endpoint - to be implemented",
		Data:    request,
	})
}

