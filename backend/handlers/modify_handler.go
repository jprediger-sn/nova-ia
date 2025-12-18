package handlers

import (
	"encoding/json"
	"net/http"

	"nova-ia-api/models"
	"nova-ia-api/utils"
)

// SendTextModify envia uma solicitação de modificação de texto
func SendTextModify(w http.ResponseWriter, r *http.Request) {
	var request map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	// TODO: Implementar lógica de sendTextModify do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Send text modify endpoint - to be implemented",
		Data:    request,
	})
}

// CheckTextModify verifica o status de uma modificação de texto
func CheckTextModify(w http.ResponseWriter, r *http.Request) {
	// TODO: Implementar lógica de checkTextModify do controller JavaScript
	// Pode receber query parameters
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Check text modify endpoint - to be implemented",
		Data:    nil,
	})
}

// ApplyTextModify aplica uma modificação de texto
func ApplyTextModify(w http.ResponseWriter, r *http.Request) {
	var request map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	// TODO: Implementar lógica de applyTextModify do controller JavaScript
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Apply text modify endpoint - to be implemented",
		Data:    request,
	})
}

