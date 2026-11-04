import { AppError } from '../../domain/errors/ApiErrorCode';
import type {
  DepositResult,
  TransferResult,
  WithdrawalResult,
} from '../../domain/ports/TransactionApi';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseExecutedAt(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  throw new AppError({
    code: 'UNKNOWN',
    message: 'Fecha de ejecución inválida.',
    statusHttp: 500,
  });
}

export function mapDepositResult(data: unknown): DepositResult {
  if (!isRecord(data)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de depósito inválida.',
      statusHttp: 500,
    });
  }
  if (
    typeof data.transactionId !== 'string' ||
    typeof data.accountId !== 'string' ||
    typeof data.amount !== 'number' ||
    data.type !== 'DEPOSIT'
  ) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de depósito inválida.',
      statusHttp: 500,
    });
  }
  return {
    transactionId: data.transactionId,
    accountId: data.accountId,
    amount: data.amount,
    type: 'DEPOSIT',
    executedAt: parseExecutedAt(data.executedAt),
  };
}

export function mapWithdrawalResult(data: unknown): WithdrawalResult {
  if (!isRecord(data)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de retiro inválida.',
      statusHttp: 500,
    });
  }
  if (
    typeof data.transactionId !== 'string' ||
    typeof data.accountId !== 'string' ||
    typeof data.amount !== 'number' ||
    data.type !== 'WITHDRAWAL'
  ) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de retiro inválida.',
      statusHttp: 500,
    });
  }
  return {
    transactionId: data.transactionId,
    accountId: data.accountId,
    amount: data.amount,
    type: 'WITHDRAWAL',
    executedAt: parseExecutedAt(data.executedAt),
  };
}

export function mapTransferResult(data: unknown): TransferResult {
  if (!isRecord(data)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de transferencia inválida.',
      statusHttp: 500,
    });
  }
  if (
    typeof data.transactionId !== 'string' ||
    typeof data.sourceAccountId !== 'string' ||
    typeof data.destinationAccountId !== 'string' ||
    typeof data.amount !== 'number'
  ) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Respuesta de transferencia inválida.',
      statusHttp: 500,
    });
  }
  return {
    transactionId: data.transactionId,
    sourceAccountId: data.sourceAccountId,
    destinationAccountId: data.destinationAccountId,
    amount: data.amount,
    executedAt: parseExecutedAt(data.executedAt),
  };
}
