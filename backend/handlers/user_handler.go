package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"nova-ia-api/models"
	"nova-ia-api/utils"
)

// GetUsers retorna a lista de usuários
func GetUsers(w http.ResponseWriter, r *http.Request) {
	users := []map[string]interface{}{
		{"id": 1, "name": "User 1"},
		{"id": 2, "name": "User 2"},
	}
	utils.JSONResponse(w, http.StatusOK, models.Response{Data: users})
}

// CreateUser cria um novo usuário
func CreateUser(w http.ResponseWriter, r *http.Request) {
	var user map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	utils.JSONResponse(w, http.StatusCreated, models.Response{
		Message: "User created",
		Data:    user,
	})
}

// GetUser retorna um usuário específico por ID
func GetUser(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	utils.JSONResponse(w, http.StatusOK, models.Response{
		Data: map[string]interface{}{"id": id, "name": "User " + id},
	})
}

