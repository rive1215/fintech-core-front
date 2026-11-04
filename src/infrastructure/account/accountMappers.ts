import { AppError } from '../../domain/errors/ApiErrorCode';
import type { Account, AccountBalance, AccountStatus } from '../../domain/entities/Account';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseBalance(value: unknown): AccountBalance {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value;
  }
  // Decimal.js u objetos con toJSON suelen llegar como string; si llega objeto, stringify defensivo.
  if (isRecord(value) && typeof value.toString === 'function') {
    return String(value);
  }
  throw new AppError({
    code: 'UNKNOWN',
    message: 'Saldo de cuenta con formato inesperado.',
    statusHttp: 500,
  });
}

function parseStatus(value: unknown): AccountStatus {
  if (value === 'ACTIVE' || value === 'FROZEN') {
    return value;
  }
  throw new AppError({
    code: 'UNKNOWN',
    message: 'Estado de cuenta con formato inesperado.',
    statusHttp: 500,
  });
}

function parseCreatedAt(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  throw new AppError({
    code: 'UNKNOWN',
    message: 'Fecha de cuenta con formato inesperado.',
    statusHttp: 500,
  });
}

/**
 * Proyecta el payload de AccountOutputDTO al modelo de dominio FE.
 * No recalcula saldo.
 */
export function mapAccount(data: unknown): Account {
  if (!isRecord(data)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de cuenta inválida.',
      statusHttp: 500,
    });
  }

  const { id, accountNumber, balance, status, userId, createdAt } = data;
  if (
    typeof id !== 'string' ||
    typeof accountNumber !== 'string' ||
    typeof userId !== 'string'
  ) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de cuenta inválida.',
      statusHttp: 500,
    });
  }

  return {
    id,
    accountNumber,
    balance: parseBalance(balance),
    status: parseStatus(status),
    userId,
    createdAt: parseCreatedAt(createdAt),
  };
}

export function mapAccountList(data: unknown): ReadonlyArray<Account> {
  if (!Array.isArray(data)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de listado de cuentas inválida.',
      statusHttp: 500,
    });
  }
  return data.map(mapAccount);
}
