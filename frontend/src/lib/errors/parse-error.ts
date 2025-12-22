import { AppError } from './types';

/**
 * Traduz códigos de erro do Cognito para mensagens amigáveis em português
 */
function translateCognitoMessage(code: string): string {
  const messages: Record<string, string> = {
    UserNotFoundException: "Usuário não encontrado.",
    NotAuthorizedException: "Usuário ou senha incorretos.",
    UserAlreadyAuthenticatedException: "Usuário já está autenticado.",
    UserNotConfirmedException:
      "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
    PasswordResetRequiredException: "Sua senha precisa ser redefinida.",
    TooManyRequestsException:
      "Muitas tentativas. Tente novamente mais tarde.",
    LimitExceededException:
      "Limite de tentativas excedido. Tente novamente em alguns minutos.",
    InvalidParameterException: "E-mail inválido.",
    CodeMismatchException: "Código de verificação incorreto.",
    ExpiredCodeException: "O código de verificação expirou. Solicite um novo código.",
    UsernameExistsException: "Este e-mail já está cadastrado.",
  };

  return messages[code] || "Erro ao autenticar.";
}

/**
 * Converte qualquer erro em um AppError padronizado
 */
export function parseError(error: any): AppError {
  // Se já for AppError, retorna diretamente
  if (error instanceof AppError) {
    return error;
  }

  // Erros do AWS Amplify Auth (v6) geralmente vêm como AuthError com cause interna
  if (error && typeof error === "object" && error.name === "AuthError" && (error as any).cause) {
    const cause = (error as any).cause;
    // Reaproveita a lógica abaixo usando a causa real do erro (ex.: UserNotFoundException)
    return parseError(cause);
  }

  // Erros do Cognito (AWS SDK v3)
  if (error && typeof error === "object") {
    const rawType = error.__type || error.name || error.code || "";
    const errorType = rawType.includes("#") ? rawType.split("#").pop() : rawType;

    // Se tem tipo de erro do Cognito
    if (errorType && (error.__type || error.code || (error.name && error.name !== "Error"))) {
      // Trata mensagem específica do Cognito
      if (error.message === "Incorrect username or password.") {
        return new AppError({
          message: "Usuário ou senha incorretos.",
          code: errorType || "NotAuthorizedException",
        });
      }

      return new AppError({
        message: translateCognitoMessage(errorType),
        code: errorType,
      });
    }
  }

  // Erros do Axios
  if (error && typeof error === "object" && error.isAxiosError) {
    return new AppError({
      message: error.response?.data?.message || "Erro no servidor",
      code: error.response?.data?.code || "SERVER_ERROR",
      status: error.response?.status,
    });
  }

  // Erros genéricos (Error instance)
  if (error instanceof Error) {
    return new AppError({
      message: error.message || "Ocorreu um erro inesperado",
      code: (error as any).name || "UNKNOWN",
    });
  }

  // Fallback para qualquer outro tipo
  return new AppError({
    message: (error && (error as any).message) || "Ocorreu um erro inesperado. Tente novamente.",
    code: (error && (error as any).code) || "UNKNOWN",
  });
}

