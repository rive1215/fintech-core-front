import { normalizeError } from '../../../domain/errors/normalizeError';
import type { TransactionHistory } from '../../../domain/entities/Transaction';
import type { TransactionHistoryApi } from '../../../domain/ports/TransactionHistoryApi';

export class GetTransactionHistoryUseCase {
  private readonly historyApi: TransactionHistoryApi;

  constructor(historyApi: TransactionHistoryApi) {
    this.historyApi = historyApi;
  }

  async execute(accountId: string): Promise<TransactionHistory> {
    try {
      return await this.historyApi.getHistory(accountId);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
