import type { TransactionHistory } from '../entities/Transaction';

/**
 * Puerto acotado al historial (GET /api/transactions/history/:accountId).
 * Las mutaciones de fondos se implementarán en un prompt posterior.
 */
export interface TransactionHistoryApi {
  getHistory(accountId: string): Promise<TransactionHistory>;
}
