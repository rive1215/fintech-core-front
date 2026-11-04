import type { TransactionHistory } from '../entities/Transaction';

/**
 * Puerto Transaction — rutas documentadas en backend-contract.md.
 */
export interface TransferInput {
  readonly sourceAccountId: string;
  readonly destinationAccountId: string;
  readonly amount: number;
  readonly description?: string;
}

export interface TransferResult {
  readonly transactionId: string;
  readonly sourceAccountId: string;
  readonly destinationAccountId: string;
  readonly amount: number;
  readonly executedAt: string;
}

export interface DepositInput {
  readonly accountId: string;
  readonly amount: number;
}

export interface DepositResult {
  readonly transactionId: string;
  readonly accountId: string;
  readonly amount: number;
  readonly type: 'DEPOSIT';
  readonly executedAt: string;
}

export interface WithdrawalInput {
  readonly accountId: string;
  readonly amount: number;
}

export interface WithdrawalResult {
  readonly transactionId: string;
  readonly accountId: string;
  readonly amount: number;
  readonly type: 'WITHDRAWAL';
  readonly executedAt: string;
}

export interface TransactionApi {
  transfer(input: TransferInput): Promise<TransferResult>;
  deposit(input: DepositInput): Promise<DepositResult>;
  withdrawal(input: WithdrawalInput): Promise<WithdrawalResult>;
  getHistory(accountId: string): Promise<TransactionHistory>;
}
