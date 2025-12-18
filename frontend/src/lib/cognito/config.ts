/**
 * Configuração do AWS Cognito
 * As variáveis de ambiente são injetadas pelo SST
 */
export const cognitoConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  region: import.meta.env.VITE_COGNITO_REGION || 'us-east-1',
};

if (!cognitoConfig.userPoolId || !cognitoConfig.clientId) {
  console.warn('Cognito configuration is missing. Make sure SST environment variables are set.');
}


