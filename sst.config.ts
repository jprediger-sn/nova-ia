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
    // Secret para a URL do banco de dados PostgreSQL
    const databaseUrl = new sst.Secret("DatabaseUrl");

    // Criar o Cognito User Pool
    const userPool = new sst.aws.CognitoUserPool("nova-ia-auth", {
      usernames: ["email"],
    });

    // Criar o Cognito User Pool Client
    const userPoolClient = userPool.addClient("nova-ia-auth-client");

    const userPoolArn = $interpolate`arn:aws:cognito-idp:${aws.getArnOutput(userPool).region}:${aws.getCallerIdentityOutput().accountId}:userpool/${userPool.id}`;

    // Criar o API Gateway com defaults para todas as rotas
    const api = new sst.aws.ApiGatewayV2("nova-ia-api-gateway", {
      cors: {
        allowOrigins: ["*"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      transform: {
        route: {
          handler: (args, opts) => {

            args.permissions ??= [
              {
                actions: [
                  "cognito-idp:ListUsers",
                  "cognito-idp:AdminGetUser",
                  "cognito-idp:AdminCreateUser",
                  "cognito-idp:AdminUpdateUserAttributes",
                  "cognito-idp:AdminDeleteUser",
                  "cognito-idp:AdminEnableUser",
                  "cognito-idp:AdminDisableUser",
                  "cognito-idp:AdminResetUserPassword",
                ],
                resources: [userPoolArn],
              },
            ];

            // Definir defaults para todas as rotas (exceto handler que é obrigatório)
            args.runtime ??= "go";
            args.timeout ??= "3 minutes";
            args.memory ??= "1024 MB";
            args.environment ??= {};
            args.environment["USER_POOL_ID"] = userPool.id;
            args.environment["DATABASE_URL"] = databaseUrl.value;
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

    // Rotas autenticadas (somente /api/*): API Gateway valida o JWT e popula
    // req.RequestContext.Authorizer.JWT.Claims (usado pelo backend/lambda.go)
    api.route("ANY /api", "./backend", {
      auth: { jwt: { authorizer: jwtAuthorizer.id } },
    });
    api.route("ANY /api/{proxy+}", "./backend", {
      auth: { jwt: { authorizer: jwtAuthorizer.id } },
    });

    // Rotas OPTIONS para CORS preflight
    api.route("OPTIONS /api", "./backend", { auth: false });
    api.route("OPTIONS /api/{proxy+}", "./backend", { auth: false });

    // Rotas públicas (ex.: /health, /swagger, /)
    // O chi router interno fará o roteamento específico
    api.route("ANY /{proxy+}", "./backend");
    api.route("ANY /", "./backend");

    // Criar o React app e expor recursos para o frontend
    const web = new sst.aws.React("nova-ia-web", {
      path: "./frontend",
      environment: {
        VITE_COGNITO_USER_POOL_ID: userPool.id,
        VITE_COGNITO_CLIENT_ID: userPoolClient.id,
        VITE_COGNITO_REGION: aws.getArnOutput(userPool).region,
        VITE_API_BASE_URL: api.url,
      },
    });
    
  },
});
