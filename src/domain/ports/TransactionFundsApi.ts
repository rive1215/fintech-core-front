import type {
  DepositInput,
  DepositResult,
  WithdrawalInput,
  WithdrawalResult,
} from './TransactionApi';

/**
 * Puerto de depósito y retiro — rutas documentadas en backend-contract.md.
 */
export interface TransactionFundsApi {
  deposit(input: DepositInput): Promise<DepositResult>;
  withdrawal(input: WithdrawalInput): Promise<WithdrawalResult>;
}

export type { DepositInput, DepositResult, WithdrawalInput, WithdrawalResult };
