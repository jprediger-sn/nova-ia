package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"nova-ia-api/models"
	"nova-ia-api/services"
	"nova-ia-api/utils"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

// ListModels lista todos os models
// GET /api/models
// Admin: retorna todos os models
// Outros: filtra por tenant_id do usuário
// @Summary Lista models
// @Description Lista todos os models. Admin vê todos os models, outros usuários veem apenas os models do seu tenant_id.
// @Tags Models
// @Accept json
// @Produce json
// @Success 200 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/models [get]
func ListModels(w http.ResponseWriter, r *http.Request) {
	db, err := services.GetDB()
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro de conexão com banco de dados",
			err.Error(),
			"DB_ERROR")
		return
	}

	tenantID := utils.GetTenantID(r)
	userRole := utils.GetUserRole(r)

	var rows pgx.Rows

	// Admin vê todos, outros veem apenas do seu tenant
	if userRole == "admin" {
		query := `SELECT id, name, tenant_id, created_at FROM models ORDER BY created_at DESC`
		rows, err = db.Query(context.Background(), query)
	} else {
		query := `SELECT id, name, tenant_id, created_at FROM models WHERE tenant_id = $1 ORDER BY created_at DESC`
		rows, err = db.Query(context.Background(), query, tenantID)
	}

	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao listar models",
			err.Error(),
			"MODELS_LIST_ERROR")
		return
	}
	defer rows.Close()

	var modelList []models.Model
	for rows.Next() {
		var m models.Model
		if err := rows.Scan(&m.ID, &m.Name, &m.TenantID, &m.CreatedAt); err != nil {
			utils.JSONErrorWithCode(w, http.StatusInternalServerError,
				"Erro ao ler dados",
				err.Error(),
				"SCAN_ERROR")
			return
		}
		modelList = append(modelList, m)
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Models encontrados com sucesso.",
		Data: map[string]interface{}{
			"data":  modelList,
			"total": len(modelList),
		},
	})
}

// GetModel busca um model específico pelo ID
// GET /api/models/{id}
// @Summary Busca model
// @Description Busca um model específico pelo ID. Admin pode buscar qualquer model, outros usuários apenas do seu tenant.
// @Tags Models
// @Accept json
// @Produce json
// @Param id path string true "ID do model"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/models/{id} [get]
func GetModel(w http.ResponseWriter, r *http.Request) {
	db, err := services.GetDB()
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro de conexão com banco de dados",
			err.Error(),
			"DB_ERROR")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'id' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	tenantID := utils.GetTenantID(r)
	userRole := utils.GetUserRole(r)

	var m models.Model
	var query string
	var args []interface{}

	// Admin pode ver qualquer model, outros apenas do seu tenant
	if userRole == "admin" {
		query = `SELECT id, name, tenant_id, created_at FROM models WHERE id = $1`
		args = []interface{}{id}
	} else {
		query = `SELECT id, name, tenant_id, created_at FROM models WHERE id = $1 AND tenant_id = $2`
		args = []interface{}{id, tenantID}
	}

	err = db.QueryRow(context.Background(), query, args...).Scan(&m.ID, &m.Name, &m.TenantID, &m.CreatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "no rows") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Model não encontrado",
				fmt.Sprintf("O model com id '%s' não foi encontrado.", id),
				"MODEL_NOT_FOUND")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao buscar model",
			err.Error(),
			"MODEL_GET_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Model encontrado com sucesso.",
		Data:    m,
	})
}

// CreateModel cria um novo model
// POST /api/models
// @Summary Cria model
// @Description Cria um novo model. Usuários não-admin terão o tenant_id definido automaticamente.
// @Tags Models
// @Accept json
// @Produce json
// @Param model body models.CreateModelRequest true "Dados do model"
// @Success 201 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/models [post]
func CreateModel(w http.ResponseWriter, r *http.Request) {
	db, err := services.GetDB()
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro de conexão com banco de dados",
			err.Error(),
			"DB_ERROR")
		return
	}

	var req models.CreateModelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Requisição inválida",
			"Erro ao decodificar JSON: "+err.Error(),
			"INVALID_REQUEST")
		return
	}

	// Validação de campos obrigatórios
	if req.Name == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'name' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	tenantID := utils.GetTenantID(r)
	userRole := utils.GetUserRole(r)

	// Se não for admin, usa tenant_id do usuário automaticamente
	// Se for admin e não forneceu tenant_id, pode ser null
	var finalTenantID *string
	if userRole != "admin" {
		if tenantID == "" {
			utils.JSONErrorWithCode(w, http.StatusBadRequest,
				"Tenant ID ausente",
				"Usuários não-admin devem ter tenant_id.",
				"MISSING_TENANT_ID")
			return
		}
		finalTenantID = &tenantID
	} else {
		// Admin pode criar com ou sem tenant_id
		finalTenantID = req.TenantID
	}

	// Gera ID único (32 caracteres hexadecimais)
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao gerar ID",
			err.Error(),
			"ID_GENERATION_ERROR")
		return
	}
	id := hex.EncodeToString(bytes)

	var m models.Model
	query := `INSERT INTO models (id, name, tenant_id, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, name, tenant_id, created_at`
	err = db.QueryRow(context.Background(), query, id, req.Name, finalTenantID).Scan(&m.ID, &m.Name, &m.TenantID, &m.CreatedAt)
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao criar model",
			err.Error(),
			"MODEL_CREATE_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusCreated, models.Response{
		Message: "Model criado com sucesso.",
		Data:    m,
	})
}

// UpdateModel atualiza um model existente
// PUT /api/models/{id}
// @Summary Atualiza model
// @Description Atualiza um model existente. Admin pode atualizar qualquer model, outros usuários apenas do seu tenant. Usuários não-admin não podem alterar tenant_id.
// @Tags Models
// @Accept json
// @Produce json
// @Param id path string true "ID do model"
// @Param model body models.UpdateModelRequest true "Dados para atualização do model"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 403 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/models/{id} [put]
func UpdateModel(w http.ResponseWriter, r *http.Request) {
	db, err := services.GetDB()
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro de conexão com banco de dados",
			err.Error(),
			"DB_ERROR")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'id' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	var req models.UpdateModelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Requisição inválida",
			"Erro ao decodificar JSON: "+err.Error(),
			"INVALID_REQUEST")
		return
	}

	// Verifica se há campos para atualizar
	if req.Name == nil && req.TenantID == nil {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Nenhum campo para atualizar",
			"Forneça pelo menos um campo para atualizar (name ou tenant_id).",
			"NO_FIELDS_TO_UPDATE")
		return
	}

	tenantID := utils.GetTenantID(r)
	userRole := utils.GetUserRole(r)

	// Verifica se o model existe e se o usuário tem permissão
	var existingTenantID *string
	checkQuery := `SELECT tenant_id FROM models WHERE id = $1`
	err = db.QueryRow(context.Background(), checkQuery, id).Scan(&existingTenantID)
	if err != nil {
		if strings.Contains(err.Error(), "no rows") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Model não encontrado",
				fmt.Sprintf("O model com id '%s' não foi encontrado.", id),
				"MODEL_NOT_FOUND")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao verificar model",
			err.Error(),
			"MODEL_CHECK_ERROR")
		return
	}

	// Verifica permissão: admin pode atualizar qualquer model, outros apenas do seu tenant
	if userRole != "admin" {
		if existingTenantID == nil || *existingTenantID != tenantID {
			utils.JSONErrorWithCode(w, http.StatusForbidden,
				"Acesso negado",
				"Você não tem permissão para atualizar este model.",
				"FORBIDDEN")
			return
		}
		// Usuários não-admin não podem alterar tenant_id
		if req.TenantID != nil && *req.TenantID != tenantID {
			utils.JSONErrorWithCode(w, http.StatusForbidden,
				"Alteração de tenant_id não permitida",
				"Usuários não-admin não podem alterar o tenant_id.",
				"TENANT_ID_CHANGE_FORBIDDEN")
			return
		}
	}

	// Monta query de atualização dinamicamente
	var updates []string
	var args []interface{}
	argIndex := 1

	if req.Name != nil {
		updates = append(updates, fmt.Sprintf("name = $%d", argIndex))
		args = append(args, *req.Name)
		argIndex++
	}

	// Apenas admin pode alterar tenant_id
	if req.TenantID != nil && userRole == "admin" {
		updates = append(updates, fmt.Sprintf("tenant_id = $%d", argIndex))
		args = append(args, *req.TenantID)
		argIndex++
	}

	args = append(args, id)
	query := fmt.Sprintf(`UPDATE models SET %s WHERE id = $%d RETURNING id, name, tenant_id, created_at`, strings.Join(updates, ", "), argIndex)

	var m models.Model
	err = db.QueryRow(context.Background(), query, args...).Scan(&m.ID, &m.Name, &m.TenantID, &m.CreatedAt)
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao atualizar model",
			err.Error(),
			"MODEL_UPDATE_ERROR")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Model atualizado com sucesso.",
		Data:    m,
	})
}

// DeleteModel remove um model
// DELETE /api/models/{id}
// @Summary Remove model
// @Description Remove um model. Admin pode deletar qualquer model, outros usuários apenas do seu tenant.
// @Tags Models
// @Accept json
// @Produce json
// @Param id path string true "ID do model"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 403 {object} models.Response
// @Failure 404 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /api/models/{id} [delete]
func DeleteModel(w http.ResponseWriter, r *http.Request) {
	db, err := services.GetDB()
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro de conexão com banco de dados",
			err.Error(),
			"DB_ERROR")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		utils.JSONErrorWithCode(w, http.StatusBadRequest,
			"Campo obrigatório ausente",
			"O campo 'id' é obrigatório.",
			"MISSING_REQUIRED_FIELD")
		return
	}

	tenantID := utils.GetTenantID(r)
	userRole := utils.GetUserRole(r)

	// Verifica se o model existe e se o usuário tem permissão
	var existingTenantID *string
	checkQuery := `SELECT tenant_id FROM models WHERE id = $1`
	err = db.QueryRow(context.Background(), checkQuery, id).Scan(&existingTenantID)
	if err != nil {
		if strings.Contains(err.Error(), "no rows") {
			utils.JSONErrorWithCode(w, http.StatusNotFound,
				"Model não encontrado",
				fmt.Sprintf("O model com id '%s' não foi encontrado.", id),
				"MODEL_NOT_FOUND")
			return
		}
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao verificar model",
			err.Error(),
			"MODEL_CHECK_ERROR")
		return
	}

	// Verifica permissão: admin pode deletar qualquer model, outros apenas do seu tenant
	if userRole != "admin" {
		if existingTenantID == nil || *existingTenantID != tenantID {
			utils.JSONErrorWithCode(w, http.StatusForbidden,
				"Acesso negado",
				"Você não tem permissão para deletar este model.",
				"FORBIDDEN")
			return
		}
	}

	// Deleta o model
	var deleteQuery string
	var deleteArgs []interface{}
	if userRole == "admin" {
		deleteQuery = `DELETE FROM models WHERE id = $1`
		deleteArgs = []interface{}{id}
	} else {
		deleteQuery = `DELETE FROM models WHERE id = $1 AND tenant_id = $2`
		deleteArgs = []interface{}{id, tenantID}
	}

	result, err := db.Exec(context.Background(), deleteQuery, deleteArgs...)
	if err != nil {
		utils.JSONErrorWithCode(w, http.StatusInternalServerError,
			"Erro ao deletar model",
			err.Error(),
			"MODEL_DELETE_ERROR")
		return
	}

	if result.RowsAffected() == 0 {
		utils.JSONErrorWithCode(w, http.StatusNotFound,
			"Model não encontrado",
			fmt.Sprintf("O model com id '%s' não foi encontrado.", id),
			"MODEL_NOT_FOUND")
		return
	}

	utils.JSONResponse(w, http.StatusOK, models.Response{
		Message: "Model deletado com sucesso.",
	})
}
