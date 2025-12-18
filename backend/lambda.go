package main

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

// Handler principal do Lambda
func handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	// Converte o evento Lambda para um http.Request
	httpReq, _ := http.NewRequest(req.RequestContext.HTTP.Method, req.RawPath, strings.NewReader(req.Body))
	// Adiciona a query string ao http.Request caso exista
	if req.RawQueryString != "" {
		httpReq.URL.RawQuery = req.RawQueryString
	}
	// Adiciona os headers ao http.Request
	for k, v := range req.Headers {
		httpReq.Header.Set(k, v)
	}

	// Extrai JWT claims do Authorizer (quando API Gateway valida o JWT)
	if req.RequestContext.Authorizer != nil && req.RequestContext.Authorizer.JWT != nil {
		// Adiciona claims como header customizado para uso no middleware
		for k, v := range req.RequestContext.Authorizer.JWT.Claims {
			// Converte valores para string
			var claimValue string
			switch val := v.(type) {
			case string:
				claimValue = val
			case float64:
				claimValue = strings.TrimSuffix(strings.TrimSuffix(fmt.Sprintf("%.0f", val), ".0"), ".0")
			default:
				claimValue = fmt.Sprintf("%v", val)
			}
			httpReq.Header.Set("X-Claim-"+k, claimValue)
		}
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
func (r *responseRecorder) Header() http.Header        { return r.headers }
func (r *responseRecorder) Write(b []byte) (int, error) { return r.body.Write(b) }
func (r *responseRecorder) WriteHeader(s int)          { r.status = s }

