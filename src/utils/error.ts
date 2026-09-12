/**
 * Tratamento e padronização de erros na aplicação
 */

export class AppError extends Error {
  public statusCode: number;
  public details?: Record<string, string[]>;

  constructor(message: string, statusCode = 400, details?: Record<string, string[]>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Extrai de forma segura e legível uma mensagem de erro de qualquer tipo de exceção
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'Ocorreu um erro inesperado'): string {
  if (!error) return fallbackMessage;

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object') {
    const obj = error as Record<string, any>;
    if (obj.message && typeof obj.message === 'string') {
      return obj.message;
    }
    if (obj.error && typeof obj.error === 'string') {
      return obj.error;
    }
    if (obj.data && typeof obj.data.message === 'string') {
      return obj.data.message;
    }
  }

  return fallbackMessage;
}
