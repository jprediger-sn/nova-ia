export type AppErrorData = {
  message: string;
  code: string;
  status?: number;
};

/**
 * Classe de erro padronizada para a aplicação
 * Estende Error para manter compatibilidade com código existente
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status?: number;

  constructor(data: AppErrorData) {
    super(data.message);
    this.name = "AppError";
    this.code = data.code;
    this.status = data.status;
  }

  /**
   * Converte AppError para objeto simples (útil para serialização)
   */
  toJSON(): AppErrorData {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
    };
  }
}

