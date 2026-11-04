import { describe, expect, it } from 'vitest';
import { AppError } from './ApiErrorCode';
import { appErrorFromApiBody, normalizeError } from './normalizeError';

describe('normalizeError', () => {
  it('preserva AppError existente', () => {
    const original = new AppError({
      code: 'INVALID_CREDENTIALS',
      message: 'Credenciales inválidas.',
      statusHttp: 401,
    });
    expect(normalizeError(original)).toBe(original);
  });

  it('normaliza unknown genérico', () => {
    const error = normalizeError('boom');
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('UNKNOWN');
  });

  it('mapea body de API con errors[]', () => {
    const error = appErrorFromApiBody(400, {
      status: 'fail',
      code: 'VALIDATION_ERROR',
      message: 'Error de validación en los datos de entrada',
      errors: [{ field: 'email', message: 'Formato inválido' }],
    });
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.fieldErrors).toEqual([
      { field: 'email', message: 'Formato inválido' },
    ]);
  });
});
