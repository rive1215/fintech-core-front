import type { AppError } from '../../domain/errors/ApiErrorCode';

/**
 * Resultado genérico de casos de uso (sin dependencias de React ni HTTP).
 */
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AppError };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T>(error: AppError): Result<T> {
  return { ok: false, error };
}
