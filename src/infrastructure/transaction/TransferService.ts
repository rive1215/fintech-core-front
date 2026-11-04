import { normalizeError } from '../../domain/errors/normalizeError';
import type { TransferApi, TransferInput, TransferResult } from '../../domain/ports/TransferApi';
import { ApiClient } from '../http/apiClient';
import { mapTransferResult } from './fundMovementMappers';

/**
 * TransferService — transferencias. Sin React.
 * description es opcional en el contrato; el UC backend puede ignorarla.
 */
export class TransferService implements TransferApi {
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async transfer(input: TransferInput): Promise<TransferResult> {
    try {
      const body: {
        sourceAccountId: string;
        destinationAccountId: string;
        amount: number;
        description?: string;
      } = {
        sourceAccountId: input.sourceAccountId,
        destinationAccountId: input.destinationAccountId,
        amount: input.amount,
      };
      if (input.description !== undefined) {
        body.description = input.description;
      }

      const data = await this.apiClient.request<unknown>({
        method: 'POST',
        path: '/api/transactions/transfer',
        body,
        auth: true,
      });
      return mapTransferResult(data);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
