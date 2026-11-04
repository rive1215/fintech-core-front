import { normalizeError } from '../../../domain/errors/normalizeError';
import type { Account } from '../../../domain/entities/Account';
import type { AccountApi } from '../../../domain/ports/AccountApi';

export class ListAccountsUseCase {
  private readonly accountApi: AccountApi;

  constructor(accountApi: AccountApi) {
    this.accountApi = accountApi;
  }

  async execute(): Promise<ReadonlyArray<Account>> {
    try {
      return await this.accountApi.listAccounts();
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
