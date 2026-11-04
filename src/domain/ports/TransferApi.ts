import type { TransferInput, TransferResult } from './TransactionApi';

/**
 * Puerto de transferencia — POST /api/transactions/transfer.
 */
export interface TransferApi {
  transfer(input: TransferInput): Promise<TransferResult>;
}

export type { TransferInput, TransferResult };
