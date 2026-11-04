import {
  AppError,
  type ApiErrorCode,
  type FieldValidationError,
} from './ApiErrorCode';

const KNOWN_CODES: ReadonlySet<string> = new Set([
  'VALIDATION_ERROR',
  'INSUFFICIENT_FUNDS',
  'INVALID_AMOUNT',
  'ACCOUNT_FROZEN',
  'DOMAIN_VALIDATION_ERROR',
  'UNAUTHORIZED',
  'INVALID_TOKEN',
  'INVALID_CREDENTIALS',
  'USER_ALREADY_EXISTS',
  'DUPLICATE_FIELD',
  'ACCOUNT_NOT_FOUND',
  'USER_NOT_FOUND',
  'RESOURCE_NOT_FOUND',
  'INTERNAL_SERVER_ERROR',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseFieldErrors(value: unknown): ReadonlyArray<FieldValidationError> {
  if (!Array.isArray(value)) {
    return [];
  }

  const errors: FieldValidationError[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }
    const field = item.field;
    const message = item.message;
    if (typeof field === 'string' && typeof message === 'string') {
      errors.push({ field, message });
    }
  }
  return errors;
}

function toApiErrorCode(code: unknown): ApiErrorCode | 'UNKNOWN' {
  if (typeof code === 'string' && KNOWN_CODES.has(code)) {
    return code as ApiErrorCode;
  }
  return 'UNKNOWN';
}

/**
 * Normaliza errores externos (`unknown`) al tipo de dominio `AppError`.
 */
export function normalizeError(error: unknown, fallbackStatus = 500): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (isRecord(error) && typeof error.statusHttp === 'number') {
    const message =
      typeof error.message === 'string' && error.message.length > 0
        ? error.message
        : 'Error inesperado.';
    return new AppError({
      code: toApiErrorCode(error.code),
      message,
      statusHttp: error.statusHttp,
      fieldErrors: parseFieldErrors(error.fieldErrors),
    });
  }

  if (error instanceof Error) {
    return new AppError({
      code: 'UNKNOWN',
      message: error.message.length > 0 ? error.message : 'Error inesperado.',
      statusHttp: fallbackStatus,
    });
  }

  return new AppError({
    code: 'UNKNOWN',
    message: 'Error inesperado.',
    statusHttp: fallbackStatus,
  });
}

export function appErrorFromApiBody(statusHttp: number, body: unknown): AppError {
  if (!isRecord(body)) {
    return new AppError({
      code: statusHttp === 401 ? 'UNAUTHORIZED' : 'UNKNOWN',
      message: 'La petición al servidor falló.',
      statusHttp,
    });
  }

  const message =
    typeof body.message === 'string' && body.message.length > 0
      ? body.message
      : 'La petición al servidor falló.';

  return new AppError({
    code: toApiErrorCode(body.code),
    message,
    statusHttp,
    fieldErrors: parseFieldErrors(body.errors),
  });
}
