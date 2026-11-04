import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../http/apiClient';
import { TransactionService } from './TransactionService';

describe('TransactionService', () => {
  it('deposit envía DTO documentado', async () => {
    const request = vi.fn().mockResolvedValue({
      transactionId: 'tx-1',
      accountId: '11111111-1111-1111-1111-111111111111',
      amount: 25,
      type: 'DEPOSIT',
      executedAt: '2026-01-01T00:00:00.000Z',
    });
    const service = new TransactionService({ request } as unknown as ApiClient);

    const result = await service.deposit({
      accountId: '11111111-1111-1111-1111-111111111111',
      amount: 25,
    });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/transactions/deposit',
      body: {
        accountId: '11111111-1111-1111-1111-111111111111',
        amount: 25,
      },
      auth: true,
    });
    expect(result.type).toBe('DEPOSIT');
  });

  it('withdrawal envía DTO documentado', async () => {
    const request = vi.fn().mockResolvedValue({
      transactionId: 'tx-2',
      accountId: '11111111-1111-1111-1111-111111111111',
      amount: 10,
      type: 'WITHDRAWAL',
      executedAt: '2026-01-01T00:00:00.000Z',
    });
    const service = new TransactionService({ request } as unknown as ApiClient);

    await service.withdrawal({
      accountId: '11111111-1111-1111-1111-111111111111',
      amount: 10,
    });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/transactions/withdrawal',
      body: {
        accountId: '11111111-1111-1111-1111-111111111111',
        amount: 10,
      },
      auth: true,
    });
  });

  it('getHistory usa la ruta documentada', async () => {
    const request = vi.fn().mockResolvedValue({
      accountId: 'acc-1',
      transactions: [],
    });
    const service = new TransactionService({ request } as unknown as ApiClient);

    await service.getHistory('acc-1');

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/transactions/history/acc-1',
      auth: true,
    });
  });
});
