package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Response struct {
	Message string `json:"message"`
	Status  int    `json:"status"`
	Path    string `json:"path,omitempty"`
	Method  string `json:"method,omitempty"`
}

func handler(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	log.Printf("Processing request: %s %s", request.RequestContext.HTTP.Method, request.RawPath)

	response := Response{
		Message: "Hello from Nova IA API",
		Status:  200,
		Path:    request.RawPath,
		Method:  request.RequestContext.HTTP.Method,
	}

	body, err := json.Marshal(response)
	if err != nil {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
			Body: fmt.Sprintf(`{"error": "%s"}`, err.Error()),
		}, nil
	}

	return events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: string(body),
	}, nil
}

func main() {
	lambda.Start(handler)
}

