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
    new sst.aws.React("nova-ia-web", {
      path: "./frontend",
    });

    // Criar o Cognito User Pool
    const userPool = new sst.aws.CognitoUserPool("nova-ia-auth", {
      usernames: ["email"],
    });

    // Criar o Cognito User Pool Client
    const userPoolClient = userPool.addClient("nova-ia-auth-client");

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

    // Rota pública (sem autenticação)
    api.route("GET /", "./backend");

    // Rotas protegidas (com autenticação JWT)
    api.route("POST /", "./backend", {
      auth: {
        jwt: {
          authorizer: jwtAuthorizer.id,
        },
      },
    });

    // Exemplo de rota protegida adicional
    api.route("GET /protected", "./backend", {
      auth: {
        jwt: {
          authorizer: jwtAuthorizer.id,
        },
      },
    });
    
  },
});
