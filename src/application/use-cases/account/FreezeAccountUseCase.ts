import { normalizeError } from '../../../domain/errors/normalizeError';
import type { Account } from '../../../domain/entities/Account';
import type { AccountApi } from '../../../domain/ports/AccountApi';

export class FreezeAccountUseCase {
  private readonly accountApi: AccountApi;

  constructor(accountApi: AccountApi) {
    this.accountApi = accountApi;
  }

  async execute(accountId: string): Promise<Account> {
    try {
      return await this.accountApi.freeze(accountId);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
