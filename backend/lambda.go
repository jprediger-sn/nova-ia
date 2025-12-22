package main

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

func hasAuthHeader(headers map[string]string) bool {
	// API Gateway V2 headers are typically lower-cased, but be defensive
	if v := headers["authorization"]; v != "" {
		return true
	}
	if v := headers["Authorization"]; v != "" {
		return true
	}
	return false
}

// Handler principal do Lambda
func handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	// Converte o evento Lambda para um http.Request
	path := req.RawPath
	if path == "" && req.RequestContext.HTTP.Path != "" {
		path = req.RequestContext.HTTP.Path
	}
	if path == "" {
		path = "/"
	}

	httpReq, err := http.NewRequest(req.RequestContext.HTTP.Method, path, strings.NewReader(req.Body))
	if err != nil {
		log.Printf("failed to build request (method=%s path=%q): %v", req.RequestContext.HTTP.Method, path, err)
		return events.APIGatewayV2HTTPResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "invalid request received",
		}, nil
	}

	// Adiciona a query string ao http.Request caso exista
	if req.RawQueryString != "" {
		httpReq.URL.RawQuery = req.RawQueryString
	}
	// Para handlers que dependem de RequestURI (ex.: http-swagger), preenche manualmente
	httpReq.RequestURI = httpReq.URL.RequestURI()
	// Adiciona os headers ao http.Request
	for k, v := range req.Headers {
		httpReq.Header.Set(k, v)
	}

	// Extrai JWT claims do Authorizer (quando API Gateway valida o JWT)
	if req.RequestContext.Authorizer != nil && req.RequestContext.Authorizer.JWT != nil {
		// Adiciona claims como header customizado para uso no middleware
		claims := req.RequestContext.Authorizer.JWT.Claims
		_, hasSub := claims["sub"]
		_, hasTenant := claims["custom:tenant_id"]
		_, hasRole := claims["custom:role"]
		log.Printf(
			"auth: authorizer claims present method=%s path=%q hasAuthz=%t claimCount=%d hasSub=%t hasTenant=%t hasRole=%t",
			req.RequestContext.HTTP.Method,
			path,
			hasAuthHeader(req.Headers),
			len(claims),
			hasSub,
			hasTenant,
			hasRole,
		)
		for k, v := range claims {
			// JWT.Claims já é map[string]string, então v é diretamente uma string
			httpReq.Header.Set("X-Claim-"+k, v)
		}
	} else {
		log.Printf(
			"auth: authorizer missing method=%s path=%q hasAuthz=%t",
			req.RequestContext.HTTP.Method,
			path,
			hasAuthHeader(req.Headers),
		)
	}

	// Cria um responseRecorder para capturar a resposta
	rr := &responseRecorder{headers: make(http.Header), body: &strings.Builder{}, status: http.StatusOK}
	// Executa o router
	router.ServeHTTP(rr, httpReq)

	// Converte os headers do responseRecorder para um mapa
	resp := make(map[string]string)
	for k, v := range rr.headers {
		if len(v) > 0 {
			resp[k] = v[0]
		}
	}

	// Converte de volta para o formato Lambda e retorna a resposta
	return events.APIGatewayV2HTTPResponse{
		StatusCode: rr.status,
		Headers:    resp,
		Body:       rr.body.String(),
	}, nil
}

// responseRecorder é um wrapper para capturar a resposta do router (estrutura do chi)
type responseRecorder struct {
	headers http.Header
	body    *strings.Builder
	status  int
}

// Implementa os métodos do ResponseWriter na estrutura responseRecorder (para usar nos handlers)
func (r *responseRecorder) Header() http.Header         { return r.headers }
func (r *responseRecorder) Write(b []byte) (int, error) { return r.body.Write(b) }
func (r *responseRecorder) WriteHeader(s int)           { r.status = s }
