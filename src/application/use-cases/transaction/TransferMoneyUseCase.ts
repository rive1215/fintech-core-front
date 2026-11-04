import { normalizeError } from '../../../domain/errors/normalizeError';
import type { TransferApi, TransferInput, TransferResult } from '../../../domain/ports/TransferApi';

export class TransferMoneyUseCase {
  private readonly transferApi: TransferApi;

  constructor(transferApi: TransferApi) {
    this.transferApi = transferApi;
  }

  async execute(input: TransferInput): Promise<TransferResult> {
    try {
      return await this.transferApi.transfer(input);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
