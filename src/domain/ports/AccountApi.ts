import type { Account } from '../entities/Account';

/**
 * Puerto Account — rutas documentadas en backend-contract.md.
 */
export interface CreateAccountInput {
  readonly initialBalance?: number;
}

export interface AccountApi {
  listAccounts(): Promise<ReadonlyArray<Account>>;
  createAccount(input: CreateAccountInput): Promise<Account>;
  getBalance(accountId: string): Promise<Account>;
  freeze(accountId: string): Promise<Account>;
  unfreeze(accountId: string): Promise<Account>;
}
