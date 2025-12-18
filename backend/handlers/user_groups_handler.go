package handlers

import (
	"net/http"

	"nova-ia-api/models"
	"nova-ia-api/utils"
)

// GetUserGroups retorna os grupos de usuários do Cognito
func GetUserGroups(w http.ResponseWriter, r *http.Request) {
	// TODO: Implementar lógica de getUserGroups do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "User groups endpoint - to be implemented",
		Data:    nil,
	})
}

