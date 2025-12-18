/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "nova-ia",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    // Criar o Cognito User Pool
    const userPool = new sst.aws.CognitoUserPool("nova-ia-auth", {
      usernames: ["email"],
    });

    // Criar o Cognito User Pool Client
    const userPoolClient = userPool.addClient("nova-ia-auth-client");

    // Criar o React app e expor recursos do Cognito
    const web = new sst.aws.React("nova-ia-web", {
      path: "./frontend",
      environment: {
        VITE_COGNITO_USER_POOL_ID: userPool.id,
        VITE_COGNITO_CLIENT_ID: userPoolClient.id,
        VITE_COGNITO_REGION: aws.getArnOutput(userPool).region,
      },
    });

    // Criar o API Gateway com defaults para todas as rotas
    const api = new sst.aws.ApiGatewayV2("nova-ia-api-gateway", {
      transform: {
        route: {
          handler: (args, opts) => {
            // Definir defaults para todas as rotas (exceto handler que é obrigatório)
            args.runtime ??= "go";
            args.timeout ??= "3 minutes";
            args.memory ??= "1024 MB";
          },
        },
      },
    });

    // Criar autorizador JWT usando Cognito
    const jwtAuthorizer = api.addAuthorizer({
      name: "jwt-authorizer",
      jwt: {
        issuer: $interpolate`https://cognito-idp.${aws.getArnOutput(userPool).region}.amazonaws.com/${userPool.id}`,
        audiences: [userPoolClient.id],
      },
    });

    // Rota catch-all: captura todas as rotas e métodos HTTP
    // O chi router interno fará o roteamento específico
    api.route("ANY /{proxy+}", "./backend");
    api.route("ANY /", "./backend");
    
  },
});
