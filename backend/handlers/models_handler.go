package handlers

import (
	"net/http"

	"nova-ia-api/models"
	"nova-ia-api/utils"
)

// GetModels retorna a lista de modelos disponíveis
func GetModels(w http.ResponseWriter, r *http.Request) {
	// TODO: Implementar lógica de getModels do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Models endpoint - to be implemented",
		Data:    nil,
	})
}
