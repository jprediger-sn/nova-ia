import { signIn, signOut, getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import type { User, LoginCredentials } from '@/features/auth/types/auth.types';

/**
 * Cliente para interagir com AWS Cognito
 */
class CognitoClient {
  /**
   * Realiza login no Cognito
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const { username, password } = credentials;
      
      const result = await signIn({
        username,
        password,
      });

      if (result.isSignedIn) {
        return await this.getCurrentUser();
      }

      throw new Error('Login failed');
    } catch (error) {
      console.error('Cognito login error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Realiza logout do Cognito
   */
  async logout(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      console.error('Cognito logout error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtém o usuário atual autenticado
   */
  async getCurrentUser(): Promise<User> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      // Extrai os tokens e claims
      const idToken = session.tokens?.idToken;
      const claims = idToken?.payload;

      if (!claims) {
        throw new Error('No token claims found');
      }

      return {
        sub: claims.sub as string || user.userId,
        email: claims.email as string || user.signInDetails?.loginId || '',
        tenantId: (claims['custom:tenant_id'] as string) || '',
        role: (claims['custom:role'] as string) || '',
      };
    } catch (error) {
      console.error('Cognito getCurrentUser error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verifica se há uma sessão ativa
   */
  async checkSession(): Promise<User | null> {
    try {
      const session = await fetchAuthSession();
      
      if (!session.tokens) {
        return null;
      }

      return await this.getCurrentUser();
    } catch (error) {
      console.error('Cognito checkSession error:', error);
      return null;
    }
  }

  /**
   * Atualiza a sessão atual
   */
  async refreshSession(): Promise<User> {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      
      if (!session.tokens) {
        throw new Error('No session found');
      }

      return await this.getCurrentUser();
    } catch (error) {
      console.error('Cognito refreshSession error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Trata erros do Cognito e retorna mensagens amigáveis
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      // Mapeia erros comuns do Cognito
      if (error.message.includes('NotAuthorizedException')) {
        return new Error('Credenciais inválidas');
      }
      if (error.message.includes('UserNotFoundException')) {
        return new Error('Usuário não encontrado');
      }
      if (error.message.includes('UserNotConfirmedException')) {
        return new Error('Usuário não confirmado');
      }
      if (error.message.includes('TooManyRequestsException')) {
        return new Error('Muitas tentativas. Tente novamente mais tarde');
      }
      return error;
    }
    return new Error('Erro desconhecido ao autenticar');
  }
}

export const cognitoClient = new CognitoClient();


