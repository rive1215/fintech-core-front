/**
 * Ítems de historial (TransactionHistoryItemDTO).
 * Fuente: docs/frontend/backend-contract.md
 */
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface TransactionHistoryItem {
  readonly id: string;
  readonly type: TransactionType;
  readonly amount: number;
  readonly status: TransactionStatus;
  readonly description: string;
  readonly createdAt: string;
  readonly sourceAccountId?: string;
  readonly destinationAccountId?: string;
}

export interface TransactionHistory {
  readonly accountId: string;
  readonly transactions: ReadonlyArray<TransactionHistoryItem>;
}
