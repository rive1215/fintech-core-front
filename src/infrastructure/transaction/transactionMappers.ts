import { AppError } from '../../domain/errors/ApiErrorCode';
import type {
  TransactionHistory,
  TransactionHistoryItem,
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/Transaction';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseType(value: unknown): TransactionType {
  if (value === 'DEPOSIT' || value === 'WITHDRAWAL' || value === 'TRANSFER') {
    return value;
  }
  throw new AppError({
    code: 'UNKNOWN',
    message: 'Tipo de transacción inesperado.',
    statusHttp: 500,
  });
}

function parseStatus(value: unknown): TransactionStatus {
  if (value === 'PENDING' || value === 'COMPLETED' || value === 'FAILED') {
    return value;
  }
  throw new AppError({
    code: 'UNKNOWN',
    message: 'Estado de transacción inesperado.',
    statusHttp: 500,
  });
}

function mapHistoryItem(data: unknown): TransactionHistoryItem {
  if (!isRecord(data)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Ítem de historial inválido.',
      statusHttp: 500,
    });
  }

  if (typeof data.id !== 'string' || typeof data.amount !== 'number') {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Ítem de historial inválido.',
      statusHttp: 500,
    });
  }

  const createdAt =
    typeof data.createdAt === 'string'
      ? data.createdAt
      : data.createdAt instanceof Date
        ? data.createdAt.toISOString()
        : null;
  if (createdAt === null) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Ítem de historial inválido.',
      statusHttp: 500,
    });
  }

  const description =
    typeof data.description === 'string'
      ? data.description
      : data.description == null
        ? ''
        : null;
  if (description === null) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Ítem de historial inválido.',
      statusHttp: 500,
    });
  }

  const base = {
    id: data.id,
    type: parseType(data.type),
    amount: data.amount,
    status: parseStatus(data.status),
    description,
    createdAt,
  };

  const sourceAccountId =
    typeof data.sourceAccountId === 'string' ? data.sourceAccountId : undefined;
  const destinationAccountId =
    typeof data.destinationAccountId === 'string'
      ? data.destinationAccountId
      : undefined;

  return {
    ...base,
    ...(sourceAccountId !== undefined ? { sourceAccountId } : {}),
    ...(destinationAccountId !== undefined ? { destinationAccountId } : {}),
  };
}

export function mapTransactionHistory(
  data: unknown,
  fallbackAccountId: string,
): TransactionHistory {
  if (!isRecord(data)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de historial inválida.',
      statusHttp: 500,
    });
  }

  const accountId =
    typeof data.accountId === 'string' ? data.accountId : fallbackAccountId;

  if (!Array.isArray(data.transactions)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de historial inválida.',
      statusHttp: 500,
    });
  }

  return {
    accountId,
    transactions: data.transactions.map(mapHistoryItem),
  };
}
