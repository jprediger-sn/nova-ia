import { Amplify } from 'aws-amplify';
import { cognitoConfig } from './config';

/**
 * Configura o AWS Amplify com as credenciais do Cognito
 * Deve ser chamado antes de usar qualquer funcionalidade de autenticação
 */
export function configureAmplify() {
  if (!cognitoConfig.userPoolId || !cognitoConfig.clientId) {
    console.warn('Cognito configuration is missing. Authentication will not work.');
    return;
  }

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
}

