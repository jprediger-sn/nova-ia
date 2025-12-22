package main

import (
	"nova-ia-api/routes"

	"github.com/aws/aws-lambda-go/lambda"
)

var router = routes.SetupRouter()

// Inicia o Lambda
func main() {
	lambda.Start(handler)
}
