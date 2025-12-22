import { Amplify } from 'aws-amplify';
import { cognitoConfig } from './config';

/**
 * Configura o AWS Amplify com as credenciais do Cognito
 * Deve ser chamado antes de usar qualquer funcionalidade de autenticação
 */
export function configureAmplify() {
  if (!cognitoConfig.userPoolId || !cognitoConfig.clientId) {
    const errorMessage = 
      'Cognito configuration is missing. ' +
      'Make sure SST environment variables are set: VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    Amplify.configure(
      {
        Auth: {
          Cognito: {
            userPoolId: cognitoConfig.userPoolId,
            userPoolClientId: cognitoConfig.clientId,
            loginWith: {
              email: true,
            },
          },
        },
      },
      {
        ssr: false,
      }
    );
    
    // Verifica se a configuração foi aplicada corretamente
    const config = Amplify.getConfig();
    if (!config.Auth?.Cognito?.userPoolId) {
      throw new Error('Failed to configure Amplify Auth');
    }
    
    console.log('Amplify configured successfully');
  } catch (error) {
    console.error('Error configuring Amplify:', error);
    throw error;
  }
}

