package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"nova-ia-api/models"
	"nova-ia-api/services"
	"nova-ia-api/utils"

	"github.com/go-chi/chi/v5"
)

var cognitoService *services.CognitoService

func init() {
	var err error
	cognitoService, err = services.NewCognitoService()
	if err != nil {
		// Log error but don't fail - service will be nil and handlers will return errors
		fmt.Printf("Warning: Failed to initialize Cognito service: %v\n", err)
	}
}

// ListUsers lista usuários do Cognito User Pool
// GET /api/users?tenant_id=xxx (tenant_id opcional)
// @Summary Lista usuários
// @Description Lista usuários do Cognito User Pool, opcionalmente filtrando por tenant_id.
// @Tags Users
// @Accept json
// @Produce json
// @Param tenant_id query string false "Tenant ID para filtrar usuários"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/users [get]
func ListUsers(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao listar usuários",
			"Serviço Cognito não inicializado",
			"USERS_LIST_ERROR")
		return
	}

	// Obtém tenant_id da query string (opcional)
	tenantID := r.URL.Query().Get("tenant_id")
	var tenantIDPtr *string
	if tenantID != "" {
		tenantIDPtr = &tenantID
	}

	users, err := cognitoService.ListUsers(tenantIDPtr)
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao listar usuários",
			err.Error(),
			"USERS_LIST_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Usuários encontrados com sucesso.",
		Data: map[string]interface{}{
			"message": "Usuários encontrados com sucesso.",
			"data":    users,
			"total":   len(users),
		},
	})
}

// GetUser busca um usuário específico pelo username
// GET /api/users/{username}
// @Summary Busca usuário
// @Description Busca um usuário específico pelo username.
// @Tags Users
// @Accept json
// @Produce json
// @Param username path string true "Username do usuário"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/users/{username} [get]
func GetUser(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao buscar usuário",
			"Serviço Cognito não inicializado",
			"USER_GET_ERROR")
		return
	}

	username := chi.URLParam(r, "username")
	if username == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'username' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	user, err := cognitoService.GetUser(username)
	if err != nil {
		if strings.Contains(err.Error(), "USER_NOT_FOUND") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Usuário não encontrado",
				fmt.Sprintf("O usuário '%s' não foi encontrado.", username),
				"USER_NOT_FOUND")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao buscar usuário",
			err.Error(),
			"USER_GET_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Usuário encontrado com sucesso.",
		Data:    user,
	})
}

// CreateUser cria um novo usuário no Cognito
// POST /api/users
// @Summary Cria usuário
// @Description Cria um novo usuário no Cognito.
// @Tags Users
// @Accept json
// @Produce json
// @Param user body models.CreateUserRequest true "Dados do usuário"
// @Success 201 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 409 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/users [post]
func CreateUser(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao criar usuário",
			"Serviço Cognito não inicializado",
			"USER_CREATE_ERROR")
		return
	}

	var req models.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Requisição inválida",
			"Erro ao decodificar JSON: "+err.Error(),
			"INVALID_REQUEST")
		return
	}

	// Validação de campos obrigatórios
	if req.Email == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'email' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	// Define role padrão se não fornecido
	if req.Role == nil {
		defaultRole := "viewer"
		req.Role = &defaultRole
	}

	// Validação de role
	validRoles := map[string]bool{"admin": true, "manager": true, "viewer": true}
	if !validRoles[*req.Role] {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Role inválido",
			"O role deve ser um dos seguintes: admin, manager, viewer",
			"INVALID_ROLE")
		return
	}

	// Admins não precisam de tenant_id
	if *req.Role != "admin" && (req.TenantID == nil || *req.TenantID == "") {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'tenant_id' é obrigatório para usuários não-admin.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	user, err := cognitoService.CreateUser(req)
	if err != nil {
		if strings.Contains(err.Error(), "USER_ALREADY_EXISTS") {
			utils.JSONErrorWithCode(w, http.StatusConflict,
				"Usuário já existe",
				fmt.Sprintf("Já existe um usuário com o email '%s'.", req.Email),
				"USER_ALREADY_EXISTS")
			return
		}
		if strings.Contains(err.Error(), "MISSING_REQUIRED_FIELD") {
			utils.JSONErrorWithCode(w, http.StatusBadRequest,
				"Campo obrigatório ausente",
				err.Error(),
				"MISSING_REQUIRED_FIELD")
			return
		}
		if strings.Contains(err.Error(), "INVALID_ROLE") {
			utils.JSONErrorWithCode(w, http.StatusBadRequest,
				"Role inválido",
				err.Error(),
				"INVALID_ROLE")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao criar usuário",
			err.Error(),
			"USER_CREATE_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusCreated, models.Response{
		Message: "Usuário criado com sucesso.",
		Data:    user,
	})
}

// UpdateUser atualiza atributos de um usuário existente
// PUT /api/users/{username}
// @Summary Atualiza usuário
// @Description Atualiza atributos de um usuário existente.
// @Tags Users
// @Accept json
// @Produce json
// @Param username path string true "Username do usuário"
// @Param user body models.UpdateUserRequest true "Dados para atualização do usuário"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/users/{username} [put]
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao atualizar usuário",
			"Serviço Cognito não inicializado",
			"USER_UPDATE_ERROR")
		return
	}

	username := chi.URLParam(r, "username")
	if username == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'username' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	var req models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Requisição inválida",
			"Erro ao decodificar JSON: "+err.Error(),
			"INVALID_REQUEST")
		return
	}

	// Validação de role se fornecido
	if req.Role != nil {
		validRoles := map[string]bool{"admin": true, "manager": true, "viewer": true}
		if !validRoles[*req.Role] {
			utils.JSONErrorWithCode(w, http.StatusBadRequest,
				"Role inválido",
				"O role deve ser um dos seguintes: admin, manager, viewer",
				"INVALID_ROLE")
			return
		}
	}

	err := cognitoService.UpdateUser(username, req)
	if err != nil {
		if strings.Contains(err.Error(), "USER_NOT_FOUND") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Usuário não encontrado",
				fmt.Sprintf("O usuário '%s' não foi encontrado.", username),
				"USER_NOT_FOUND")
			return
		}
		if strings.Contains(err.Error(), "NO_FIELDS_TO_UPDATE") {
			utils.JSONErrorWithCode(w, http.StatusBadRequest,
				"Nenhum campo para atualizar",
				"Forneça pelo menos um campo para atualizar (tenant_id, role ou name).",
				"NO_FIELDS_TO_UPDATE")
			return
		}
		if strings.Contains(err.Error(), "INVALID_ROLE") {
			utils.JSONErrorWithCode(w, http.StatusBadRequest,
				"Role inválido",
				err.Error(),
				"INVALID_ROLE")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao atualizar usuário",
			err.Error(),
			"USER_UPDATE_ERROR")
		return
	}

	// Busca dados atualizados
	user, err := cognitoService.GetUser(username)
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao buscar usuário atualizado",
			err.Error(),
			"USER_GET_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Usuário atualizado com sucesso.",
		Data:    user,
	})
}

// DeleteUser remove um usuário do Cognito
// DELETE /api/users/{username}
// @Summary Remove usuário
// @Description Remove um usuário do Cognito.
// @Tags Users
// @Accept json
// @Produce json
// @Param username path string true "Username do usuário"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/users/{username} [delete]
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao deletar usuário",
			"Serviço Cognito não inicializado",
			"USER_DELETE_ERROR")
		return
	}

	username := chi.URLParam(r, "username")
	if username == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'username' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	err := cognitoService.DeleteUser(username)
	if err != nil {
		if strings.Contains(err.Error(), "USER_NOT_FOUND") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Usuário não encontrado",
				fmt.Sprintf("O usuário '%s' não foi encontrado.", username),
				"USER_NOT_FOUND")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao deletar usuário",
			err.Error(),
			"USER_DELETE_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Usuário deletado com sucesso.",
	})
}

// EnableUser habilita um usuário desabilitado
// POST /api/users/{username}/enable
// @Summary Habilita usuário
// @Description Habilita um usuário desabilitado no Cognito.
// @Tags Users
// @Accept json
// @Produce json
// @Param username path string true "Username do usuário"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/users/{username}/enable [post]
func EnableUser(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao habilitar usuário",
			"Serviço Cognito não inicializado",
			"USER_ENABLE_ERROR")
		return
	}

	username := chi.URLParam(r, "username")
	if username == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'username' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	err := cognitoService.EnableUser(username)
	if err != nil {
		if strings.Contains(err.Error(), "USER_NOT_FOUND") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Usuário não encontrado",
				fmt.Sprintf("O usuário '%s' não foi encontrado.", username),
				"USER_NOT_FOUND")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao habilitar usuário",
			err.Error(),
			"USER_ENABLE_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Usuário habilitado com sucesso.",
	})
}

// DisableUser desabilita um usuário (sem deletá-lo)
// POST /api/users/{username}/disable
// @Summary Desabilita usuário
// @Description Desabilita um usuário sem deletá-lo.
// @Tags Users
// @Accept json
// @Produce json
// @Param username path string true "Username do usuário"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/users/{username}/disable [post]
func DisableUser(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao desabilitar usuário",
			"Serviço Cognito não inicializado",
			"USER_DISABLE_ERROR")
		return
	}

	username := chi.URLParam(r, "username")
	if username == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'username' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	err := cognitoService.DisableUser(username)
	if err != nil {
		if strings.Contains(err.Error(), "USER_NOT_FOUND") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Usuário não encontrado",
				fmt.Sprintf("O usuário '%s' não foi encontrado.", username),
				"USER_NOT_FOUND")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao desabilitar usuário",
			err.Error(),
			"USER_DISABLE_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Usuário desabilitado com sucesso.",
	})
}

// ResetUserPassword força reset de senha do usuário (envia email com senha temporária)
// POST /api/users/{username}/reset-password
// @Summary Reseta senha do usuário
// @Description Força o reset de senha do usuário, enviando email com senha temporária.
// @Tags Users
// @Accept json
// @Produce json
// @Param username path string true "Username do usuário"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/users/{username}/reset-password [post]
func ResetUserPassword(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao resetar senha",
			"Serviço Cognito não inicializado",
			"PASSWORD_RESET_ERROR")
		return
	}

	username := chi.URLParam(r, "username")
	if username == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'username' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	err := cognitoService.ResetUserPassword(username)
	if err != nil {
		if strings.Contains(err.Error(), "USER_NOT_FOUND") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Usuário não encontrado",
				fmt.Sprintf("O usuário '%s' não foi encontrado.", username),
				"USER_NOT_FOUND")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao resetar senha",
			err.Error(),
			"PASSWORD_RESET_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Senha resetada com sucesso. O usuário receberá um email com instruções.",
	})
}

// ListTenants lista todos os tenant_ids únicos existentes no sistema
// Busca apenas nos usuários do Cognito
// GET /api/tenants
// @Summary Lista tenants
// @Description Lista todos os tenant_ids únicos existentes no sistema (a partir dos usuários do Cognito).
// @Tags Tenants
// @Accept json
// @Produce json
// @Success 200 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/tenants [get]
func ListTenants(w http.ResponseWriter, r *http.Request) {
	if cognitoService == nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao listar tenants",
			"Serviço Cognito não inicializado",
			"TENANTS_LIST_ERROR")
		return
	}

	tenants, err := cognitoService.ListTenants()
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao listar tenants",
			err.Error(),
			"TENANTS_LIST_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Tenants encontrados com sucesso.",
		Data: map[string]interface{}{
			"message": "Tenants encontrados com sucesso.",
			"data":    tenants,
			"total":   len(tenants),
		},
	})
}
