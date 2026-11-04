import { normalizeError } from '../../../domain/errors/normalizeError';
import type {
  TransactionFundsApi,
  WithdrawalInput,
  WithdrawalResult,
} from '../../../domain/ports/TransactionFundsApi';

export class WithdrawFundsUseCase {
  private readonly fundsApi: TransactionFundsApi;

  constructor(fundsApi: TransactionFundsApi) {
    this.fundsApi = fundsApi;
  }

  async execute(input: WithdrawalInput): Promise<WithdrawalResult> {
    try {
      return await this.fundsApi.withdrawal(input);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
