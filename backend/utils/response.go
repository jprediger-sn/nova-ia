package utils

import (
	"encoding/json"
	"net/http"

	"nova-ia-api/models"
)

// JSONResponse escreve uma resposta JSON com status code
func JSONResponse(w http.ResponseWriter, status int, data models.Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// JSONError escreve uma resposta de erro JSON
func JSONError(w http.ResponseWriter, status int, message string) {
	JSONResponse(w, status, models.Response{Error: message})
}

// JSONErrorWithCode escreve uma resposta de erro JSON com código e detalhes
func JSONErrorWithCode(w http.ResponseWriter, status int, errorMsg, details, code string) {
	JSONResponse(w, status, models.Response{
		Error:   errorMsg,
		Details: details,
		Code:    code,
	})
}
