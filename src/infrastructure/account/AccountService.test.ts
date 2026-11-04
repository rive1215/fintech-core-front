import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../http/apiClient';
import { AccountService } from './AccountService';

describe('AccountService', () => {
  it('listAccounts mapea AccountOutputDTO[]', async () => {
    const request = vi.fn().mockResolvedValue([
      {
        id: 'acc-1',
        accountNumber: 'ACC-123456789',
        balance: '100.5',
        status: 'ACTIVE',
        userId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    const service = new AccountService({ request } as unknown as ApiClient);

    const result = await service.listAccounts();

    expect(request).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/accounts',
      auth: true,
    });
    expect(result).toEqual([
      {
        id: 'acc-1',
        accountNumber: 'ACC-123456789',
        balance: '100.5',
        status: 'ACTIVE',
        userId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('createAccount no envía userId', async () => {
    const request = vi.fn().mockResolvedValue({
      id: 'acc-2',
      accountNumber: 'ACC-999',
      balance: 0,
      status: 'ACTIVE',
      userId: 'user-1',
      createdAt: '2026-01-02T00:00:00.000Z',
    });
    const service = new AccountService({ request } as unknown as ApiClient);

    await service.createAccount({ initialBalance: 10 });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/accounts',
      body: { initialBalance: 10 },
      auth: true,
    });
    const body = request.mock.calls[0]?.[0]?.body as Record<string, unknown>;
    expect(body).not.toHaveProperty('userId');
  });

  it('freeze llama PATCH .../freeze', async () => {
    const request = vi.fn().mockResolvedValue({
      id: 'acc-1',
      accountNumber: 'ACC-1',
      balance: 0,
      status: 'FROZEN',
      userId: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const service = new AccountService({ request } as unknown as ApiClient);

    await service.freeze('acc-1');

    expect(request).toHaveBeenCalledWith({
      method: 'PATCH',
      path: '/api/accounts/acc-1/freeze',
      auth: true,
    });
  });
});
