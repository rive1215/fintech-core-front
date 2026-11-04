import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../http/apiClient';
import { TransferService } from './TransferService';

describe('TransferService', () => {
  it('transfer envía DTO documentado', async () => {
    const request = vi.fn().mockResolvedValue({
      transactionId: 'tx-3',
      sourceAccountId: '11111111-1111-1111-1111-111111111111',
      destinationAccountId: '22222222-2222-2222-2222-222222222222',
      amount: 5,
      executedAt: '2026-01-01T00:00:00.000Z',
    });
    const service = new TransferService({ request } as unknown as ApiClient);

    await service.transfer({
      sourceAccountId: '11111111-1111-1111-1111-111111111111',
      destinationAccountId: '22222222-2222-2222-2222-222222222222',
      amount: 5,
      description: 'pago',
    });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/transactions/transfer',
      body: {
        sourceAccountId: '11111111-1111-1111-1111-111111111111',
        destinationAccountId: '22222222-2222-2222-2222-222222222222',
        amount: 5,
        description: 'pago',
      },
      auth: true,
    });
  });
});
