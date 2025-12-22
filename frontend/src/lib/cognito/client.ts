import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignIn,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
} from "@aws-amplify/auth";
import type { User, LoginCredentials } from "@/features/auth/types/auth.types";
import { parseError, AppError } from "@/lib/errors";

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

      // Verifica se há um challenge NEW_PASSWORD_REQUIRED
      if (
        result.nextStep?.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        // O Amplify gerencia a sessão internamente, então não precisamos passar explicitamente
        // Usamos o username como email (já que o Cognito está configurado com email como username)
        throw new AppError({
          message: "Você precisa definir uma nova senha para continuar",
          code: "NEW_PASSWORD_REQUIRED",
          status: 400,
        });
      }

      if (result.isSignedIn) {
        return await this.getCurrentUser();
      }

      throw new Error("Login failed");
    } catch (error) {
      // Log detalhado do erro bruto do Amplify para depuração
      console.error("CognitoClient login raw error:", error);

      // Caso já exista sessão ativa, apenas retorna o usuário atual
      if (this.isAlreadyAuthenticatedError(error)) {
        try {
          const currentUser = await this.getCurrentUser();
          return currentUser;
        } catch (innerError) {
          console.error("CognitoClient getCurrentUser after already-auth error:", innerError);
          // Se não conseguir recuperar, retorna AppError específico
          throw new AppError({
            message: "Usuário já está autenticado.",
            code: "UserAlreadyAuthenticatedException",
            status: 400,
          });
        }
      }

      throw this.handleError(error);
    }
  }

  /**
   * Confirma a nova senha quando há challenge NEW_PASSWORD_REQUIRED
   * O parâmetro session não é necessário pois o Amplify gerencia a sessão internamente
   */
  async confirmNewPassword(
    _session: string,
    newPassword: string
  ): Promise<User> {
    try {
      const result = await confirmSignIn({
        challengeResponse: newPassword,
      });

      if (result.isSignedIn) {
        return await this.getCurrentUser();
      }

      throw new Error("Falha ao confirmar nova senha");
    } catch (error) {
      console.error("Cognito confirmNewPassword error:", error);
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
      console.error("Cognito logout error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Valida se o usuário tem tenant_id e role preenchidos
   */
  private validateUser(user: User): void {
    if (!user.tenantId?.trim() || !user.role?.trim()) {
      throw new AppError({
        message: "Usuário inválido: tenant_id e role são obrigatórios. Entre em contato com o administrador.",
        code: "INVALID_USER_ERROR",
        status: 400,
      });
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
        throw new Error("No token claims found");
      }

      const userObj: User = {
        sub: (claims.sub as string) || user.userId,
        email: (claims.email as string) || user.signInDetails?.loginId || "",
        tenantId: (claims["custom:tenant_id"] as string) || "",
        role: (claims["custom:role"] as string) || "",
      };

      // Valida se tenant_id e role estão preenchidos
      this.validateUser(userObj);

      return userObj;
    } catch (error) {
      console.error("Cognito getCurrentUser error:", error);
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

      const user = await this.getCurrentUser();
      // Se chegou aqui, o usuário foi validado em getCurrentUser
      return user;
    } catch (error) {
      console.error("Cognito checkSession error:", error);
      // Retorna null silenciosamente para usuários inválidos
      // Isso permite que a aplicação trate como não autenticado
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
        throw new Error("No session found");
      }

      return await this.getCurrentUser();
    } catch (error) {
      console.error("Cognito refreshSession error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Retorna o ID Token JWT atual para chamadas autenticadas na API
   */
  async getIdToken(): Promise<string> {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new AppError({
          message: "Sessão expirada. Faça login novamente.",
          code: "UNAUTHENTICATED",
          status: 401,
        });
      }

      return token;
    } catch (error) {
      console.error("Cognito getIdToken error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Solicita reset de senha - envia código de verificação por email
   */
  async resetPassword(username: string): Promise<void> {
    try {
      await amplifyResetPassword({ username });
    } catch (error) {
      console.error("Cognito resetPassword error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Confirma reset de senha com código de verificação e nova senha
   */
  async confirmResetPassword(
    username: string,
    confirmationCode: string,
    newPassword: string
  ): Promise<void> {
    try {
      await amplifyConfirmResetPassword({
        username,
        confirmationCode,
        newPassword,
      });
    } catch (error) {
      console.error("Cognito confirmResetPassword error:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Trata erros do Cognito e retorna AppError padronizado
   * Erros customizados são convertidos para AppError mantendo o código original
   */
  private handleError(error: any): AppError {
    return parseError(error);
  }

  /**
   * Detecta erro de sessão já autenticada (Amplify v6)
   */
  private isAlreadyAuthenticatedError(error: any): boolean {
    if (!error || typeof error !== "object") return false;

    const name = (error as any).name || (error as any).__type || (error as any).code;
    if (name === "UserAlreadyAuthenticatedException") return true;

    // Amplify AuthError com cause interna
    const cause = (error as any).cause;
    if (cause && typeof cause === "object") {
      const causeName = (cause as any).name || (cause as any).__type || (cause as any).code;
      return causeName === "UserAlreadyAuthenticatedException";
    }

    return false;
  }
}
export const cognitoClient = new CognitoClient();
