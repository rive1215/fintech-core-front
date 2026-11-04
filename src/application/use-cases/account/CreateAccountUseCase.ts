import { normalizeError } from '../../../domain/errors/normalizeError';
import type { Account } from '../../../domain/entities/Account';
import type { AccountApi, CreateAccountInput } from '../../../domain/ports/AccountApi';

export class CreateAccountUseCase {
  private readonly accountApi: AccountApi;

  constructor(accountApi: AccountApi) {
    this.accountApi = accountApi;
  }

  async execute(input: CreateAccountInput = {}): Promise<Account> {
    try {
      const payload: CreateAccountInput =
        input.initialBalance === undefined
          ? {}
          : { initialBalance: input.initialBalance };
      return await this.accountApi.createAccount(payload);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
