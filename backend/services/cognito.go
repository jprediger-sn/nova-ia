package services

import (
	"context"
	"errors"
	"fmt"
	"os"
	"sort"

	"nova-ia-api/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
)

// CognitoService gerencia operações com AWS Cognito
type CognitoService struct {
	client *cognitoidentityprovider.Client
	poolID string
}

// NewCognitoService cria uma nova instância do serviço Cognito
func NewCognitoService() (*CognitoService, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	poolID := os.Getenv("USER_POOL_ID")
	if poolID == "" {
		return nil, fmt.Errorf("USER_POOL_ID environment variable is not set")
	}

	return &CognitoService{
		client: cognitoidentityprovider.NewFromConfig(cfg),
		poolID: poolID,
	}, nil
}

// ListUsers lista usuários do Cognito User Pool
// Se tenantID for fornecido, filtra por esse tenant
func (s *CognitoService) ListUsers(tenantID *string) ([]models.User, error) {
	var users []models.User
	var paginationToken *string

	for {
		input := &cognitoidentityprovider.ListUsersInput{
			UserPoolId: aws.String(s.poolID),
			Limit:      aws.Int32(60),
		}

		if paginationToken != nil {
			input.PaginationToken = paginationToken
		}

		output, err := s.client.ListUsers(context.TODO(), input)
		if err != nil {
			return nil, fmt.Errorf("failed to list users: %w", err)
		}

		for _, user := range output.Users {
			userData := s.extractUserData(user)

			// Filtra por tenant_id se fornecido
			if tenantID != nil {
				if userData.TenantID == nil || *userData.TenantID != *tenantID {
					continue
				}
			}

			users = append(users, userData)
		}

		// Verifica se há mais páginas
		if output.PaginationToken != nil {
			paginationToken = output.PaginationToken
		} else {
			break
		}
	}

	return users, nil
}

// GetUser busca um usuário específico pelo username
func (s *CognitoService) GetUser(username string) (*models.User, error) {
	input := &cognitoidentityprovider.AdminGetUserInput{
		UserPoolId: aws.String(s.poolID),
		Username:   aws.String(username),
	}

	output, err := s.client.AdminGetUser(context.TODO(), input)
	if err != nil {
		var notFoundErr *types.UserNotFoundException
		if errors.As(err, &notFoundErr) {
			return nil, fmt.Errorf("USER_NOT_FOUND: %w", err)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	user := s.extractUserDataFromAdminGetUser(output)
	return &user, nil
}

// CreateUser cria um novo usuário no Cognito
func (s *CognitoService) CreateUser(req models.CreateUserRequest) (*models.User, error) {
	// Validação de campos obrigatórios
	if req.Email == "" {
		return nil, fmt.Errorf("MISSING_REQUIRED_FIELD: email is required")
	}

	email := req.Email
	role := "viewer"
	if req.Role != nil {
		role = *req.Role
	}

	// Validação de role
	validRoles := map[string]bool{"admin": true, "manager": true, "viewer": true}
	if !validRoles[role] {
		return nil, fmt.Errorf("INVALID_ROLE: role must be one of: admin, manager, viewer")
	}

	// Admins não precisam de tenant_id
	if role != "admin" && (req.TenantID == nil || *req.TenantID == "") {
		return nil, fmt.Errorf("MISSING_REQUIRED_FIELD: tenant_id is required for non-admin users")
	}

	// Atributos do usuário
	userAttributes := []types.AttributeType{
		{Name: aws.String("email"), Value: aws.String(email)},
		{Name: aws.String("email_verified"), Value: aws.String("true")},
		{Name: aws.String("custom:role"), Value: aws.String(role)},
	}

	// Adiciona nome se fornecido
	if req.Name != nil && *req.Name != "" {
		userAttributes = append(userAttributes, types.AttributeType{
			Name:  aws.String("name"),
			Value: req.Name,
		})
	}

	// Adiciona tenant_id se fornecido
	if req.TenantID != nil && *req.TenantID != "" {
		userAttributes = append(userAttributes, types.AttributeType{
			Name:  aws.String("custom:tenant_id"),
			Value: req.TenantID,
		})
	}

	// Parâmetros para criação
	createInput := &cognitoidentityprovider.AdminCreateUserInput{
		UserPoolId:             aws.String(s.poolID),
		Username:               aws.String(email),
		UserAttributes:         userAttributes,
		DesiredDeliveryMediums: []types.DeliveryMediumType{types.DeliveryMediumTypeEmail},
	}

	// Senha temporária se fornecida
	if req.TemporaryPassword != nil && *req.TemporaryPassword != "" {
		createInput.TemporaryPassword = req.TemporaryPassword
	}

	// Cria o usuário
	output, err := s.client.AdminCreateUser(context.TODO(), createInput)
	if err != nil {
		var existsErr *types.UsernameExistsException
		if errors.As(err, &existsErr) {
			return nil, fmt.Errorf("USER_ALREADY_EXISTS: %w", err)
		}
		return nil, fmt.Errorf("USER_CREATE_ERROR: %w", err)
	}

	user := s.extractUserData(*output.User)
	return &user, nil
}

// UpdateUser atualiza atributos de um usuário existente
func (s *CognitoService) UpdateUser(username string, req models.UpdateUserRequest) error {
	// Validação de role se fornecido
	if req.Role != nil {
		validRoles := map[string]bool{"admin": true, "manager": true, "viewer": true}
		if !validRoles[*req.Role] {
			return fmt.Errorf("INVALID_ROLE: role must be one of: admin, manager, viewer")
		}
	}

	// Monta lista de atributos a atualizar
	userAttributes := []types.AttributeType{}

	if req.TenantID != nil {
		userAttributes = append(userAttributes, types.AttributeType{
			Name:  aws.String("custom:tenant_id"),
			Value: req.TenantID,
		})
	}

	if req.Role != nil {
		userAttributes = append(userAttributes, types.AttributeType{
			Name:  aws.String("custom:role"),
			Value: req.Role,
		})
	}

	if req.Name != nil {
		userAttributes = append(userAttributes, types.AttributeType{
			Name:  aws.String("name"),
			Value: req.Name,
		})
	}

	if len(userAttributes) == 0 {
		return fmt.Errorf("NO_FIELDS_TO_UPDATE: provide at least one field to update (tenant_id, role or name)")
	}

	// Atualiza o usuário
	input := &cognitoidentityprovider.AdminUpdateUserAttributesInput{
		UserPoolId:     aws.String(s.poolID),
		Username:       aws.String(username),
		UserAttributes: userAttributes,
	}

	_, err := s.client.AdminUpdateUserAttributes(context.TODO(), input)
	if err != nil {
		var notFoundErr *types.UserNotFoundException
		if errors.As(err, &notFoundErr) {
			return fmt.Errorf("USER_NOT_FOUND: %w", err)
		}
		return fmt.Errorf("USER_UPDATE_ERROR: %w", err)
	}

	return nil
}

// DeleteUser remove um usuário do Cognito
func (s *CognitoService) DeleteUser(username string) error {
	input := &cognitoidentityprovider.AdminDeleteUserInput{
		UserPoolId: aws.String(s.poolID),
		Username:   aws.String(username),
	}

	_, err := s.client.AdminDeleteUser(context.TODO(), input)
	if err != nil {
		var notFoundErr *types.UserNotFoundException
		if errors.As(err, &notFoundErr) {
			return fmt.Errorf("USER_NOT_FOUND: %w", err)
		}
		return fmt.Errorf("USER_DELETE_ERROR: %w", err)
	}

	return nil
}

// EnableUser habilita um usuário desabilitado
func (s *CognitoService) EnableUser(username string) error {
	input := &cognitoidentityprovider.AdminEnableUserInput{
		UserPoolId: aws.String(s.poolID),
		Username:   aws.String(username),
	}

	_, err := s.client.AdminEnableUser(context.TODO(), input)
	if err != nil {
		var notFoundErr *types.UserNotFoundException
		if errors.As(err, &notFoundErr) {
			return fmt.Errorf("USER_NOT_FOUND: %w", err)
		}
		return fmt.Errorf("USER_ENABLE_ERROR: %w", err)
	}

	return nil
}

// DisableUser desabilita um usuário (sem deletá-lo)
func (s *CognitoService) DisableUser(username string) error {
	input := &cognitoidentityprovider.AdminDisableUserInput{
		UserPoolId: aws.String(s.poolID),
		Username:   aws.String(username),
	}

	_, err := s.client.AdminDisableUser(context.TODO(), input)
	if err != nil {
		var notFoundErr *types.UserNotFoundException
		if errors.As(err, &notFoundErr) {
			return fmt.Errorf("USER_NOT_FOUND: %w", err)
		}
		return fmt.Errorf("USER_DISABLE_ERROR: %w", err)
	}

	return nil
}

// ResetUserPassword força reset de senha do usuário (envia email com senha temporária)
func (s *CognitoService) ResetUserPassword(username string) error {
	input := &cognitoidentityprovider.AdminResetUserPasswordInput{
		UserPoolId: aws.String(s.poolID),
		Username:   aws.String(username),
	}

	_, err := s.client.AdminResetUserPassword(context.TODO(), input)
	if err != nil {
		var notFoundErr *types.UserNotFoundException
		if errors.As(err, &notFoundErr) {
			return fmt.Errorf("USER_NOT_FOUND: %w", err)
		}
		return fmt.Errorf("PASSWORD_RESET_ERROR: %w", err)
	}

	return nil
}

// ListTenants lista todos os tenant_ids únicos existentes no sistema
// Busca apenas nos usuários do Cognito
func (s *CognitoService) ListTenants() ([]string, error) {
	tenants := make(map[string]bool)
	var paginationToken *string

	for {
		input := &cognitoidentityprovider.ListUsersInput{
			UserPoolId: aws.String(s.poolID),
			Limit:      aws.Int32(60),
		}

		if paginationToken != nil {
			input.PaginationToken = paginationToken
		}

		output, err := s.client.ListUsers(context.TODO(), input)
		if err != nil {
			return nil, fmt.Errorf("TENANTS_LIST_ERROR: %w", err)
		}

		for _, user := range output.Users {
			for _, attr := range user.Attributes {
				if attr.Name != nil && *attr.Name == "custom:tenant_id" && attr.Value != nil && *attr.Value != "" {
					tenants[*attr.Value] = true
				}
			}
		}

		// Verifica se há mais páginas
		if output.PaginationToken != nil {
			paginationToken = output.PaginationToken
		} else {
			break
		}
	}

	// Converte map para slice ordenada
	result := make([]string, 0, len(tenants))
	for tenant := range tenants {
		result = append(result, tenant)
	}
	sort.Strings(result)

	return result, nil
}

// extractUserData extrai dados do usuário de um tipo UserType
func (s *CognitoService) extractUserData(user types.UserType) models.User {
	userData := models.User{
		Username: aws.ToString(user.Username),
		Status:   string(user.UserStatus),
		Enabled:  user.Enabled,
	}

	if user.UserCreateDate != nil {
		userData.CreatedAt = user.UserCreateDate
	}

	if user.UserLastModifiedDate != nil {
		userData.LastModified = user.UserLastModifiedDate
	}

	// Extrai atributos customizados
	for _, attr := range user.Attributes {
		if attr.Name == nil || attr.Value == nil {
			continue
		}

		switch *attr.Name {
		case "email":
			userData.Email = attr.Value
		case "name":
			userData.Name = attr.Value
		case "custom:tenant_id":
			userData.TenantID = attr.Value
		case "custom:role":
			userData.Role = attr.Value
		}
	}

	return userData
}

// extractUserDataFromAdminGetUser extrai dados do usuário de AdminGetUserOutput
func (s *CognitoService) extractUserDataFromAdminGetUser(output *cognitoidentityprovider.AdminGetUserOutput) models.User {
	userData := models.User{
		Username: aws.ToString(output.Username),
		Status:   string(output.UserStatus),
		Enabled:  output.Enabled,
	}

	if output.UserCreateDate != nil {
		createdAt := *output.UserCreateDate
		userData.CreatedAt = &createdAt
	}

	if output.UserLastModifiedDate != nil {
		lastModified := *output.UserLastModifiedDate
		userData.LastModified = &lastModified
	}

	// Extrai atributos customizados
	for _, attr := range output.UserAttributes {
		if attr.Name == nil || attr.Value == nil {
			continue
		}

		switch *attr.Name {
		case "email":
			userData.Email = attr.Value
		case "name":
			userData.Name = attr.Value
		case "custom:tenant_id":
			userData.TenantID = attr.Value
		case "custom:role":
			userData.Role = attr.Value
		}
	}

	return userData
}
