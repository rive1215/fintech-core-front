import { normalizeError } from '../../domain/errors/normalizeError';
import type { TransactionHistory } from '../../domain/entities/Transaction';
import type { TransactionHistoryApi } from '../../domain/ports/TransactionHistoryApi';
import type {
  DepositInput,
  DepositResult,
  TransactionFundsApi,
  WithdrawalInput,
  WithdrawalResult,
} from '../../domain/ports/TransactionFundsApi';
import { ApiClient } from '../http/apiClient';
import { mapDepositResult, mapWithdrawalResult } from './fundMovementMappers';
import { mapTransactionHistory } from './transactionMappers';

/**
 * TransactionService — depósitos, retiros e historial. Sin React.
 */
export class TransactionService implements TransactionFundsApi, TransactionHistoryApi {
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async deposit(input: DepositInput): Promise<DepositResult> {
    try {
      const data = await this.apiClient.request<unknown>({
        method: 'POST',
        path: '/api/transactions/deposit',
        body: {
          accountId: input.accountId,
          amount: input.amount,
        },
        auth: true,
      });
      return mapDepositResult(data);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }

  async withdrawal(input: WithdrawalInput): Promise<WithdrawalResult> {
    try {
      const data = await this.apiClient.request<unknown>({
        method: 'POST',
        path: '/api/transactions/withdrawal',
        body: {
          accountId: input.accountId,
          amount: input.amount,
        },
        auth: true,
      });
      return mapWithdrawalResult(data);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }

  async getHistory(accountId: string): Promise<TransactionHistory> {
    try {
      if (accountId.length === 0) {
        throw normalizeError({
          code: 'VALIDATION_ERROR',
          message: 'El parámetro accountId es requerido.',
          statusHttp: 400,
        });
      }
      const data = await this.apiClient.request<unknown>({
        method: 'GET',
        path: `/api/transactions/history/${encodeURIComponent(accountId)}`,
        auth: true,
      });
      return mapTransactionHistory(data, accountId);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
