package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"nova-ia-api/routes"
)

var router = routes.SetupRouter()

// Inicia o Lambda
func main() {
	lambda.Start(handler)
}

