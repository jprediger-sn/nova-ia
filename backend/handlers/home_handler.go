package handlers

import (
	"net/http"

	"nova-ia-api/models"
	"nova-ia-api/utils"
)

// Home retorna a mensagem de boas-vindas
func Home(w http.ResponseWriter, r *http.Request) {
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Welcome to Nova IA API",
	})
}

// Health retorna o status de saúde da API
func Health(w http.ResponseWriter, r *http.Request) {
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "OK",
	})
}

// NotFound retorna resposta 404 para rotas não encontradas
func NotFound(w http.ResponseWriter, r *http.Request) {
	utils.JSONResponse(w, http.StatusNotFound, models.Response{
		Message: "Rota/Método não tratado.",
		Error:   "Not Found",
	})
}

