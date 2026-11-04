import { normalizeError } from '../../../domain/errors/normalizeError';
import type {
  DepositInput,
  DepositResult,
  TransactionFundsApi,
} from '../../../domain/ports/TransactionFundsApi';

export class DepositFundsUseCase {
  private readonly fundsApi: TransactionFundsApi;

  constructor(fundsApi: TransactionFundsApi) {
    this.fundsApi = fundsApi;
  }

  async execute(input: DepositInput): Promise<DepositResult> {
    try {
      return await this.fundsApi.deposit(input);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
