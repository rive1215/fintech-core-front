import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../domain/errors/ApiErrorCode';
import { ApiClient } from '../http/apiClient';
import { AuthService } from './AuthService';

describe('AuthService', () => {
  it('login devuelve accessToken y user desde el envelope success', async () => {
    const request = vi.fn().mockResolvedValue({
      accessToken: 'jwt-token',
      user: {
        id: 'user-1',
        email: 'ana@bank.test',
        fullName: 'Ana Pérez',
      },
    });

    const apiClient = { request } as unknown as ApiClient;
    const service = new AuthService(apiClient);

    const result = await service.login({
      email: 'ana@bank.test',
      password: 'password123',
    });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'ana@bank.test', password: 'password123' },
      auth: false,
    });
    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 'user-1',
        email: 'ana@bank.test',
        fullName: 'Ana Pérez',
      },
    });
  });

  it('login propaga AppError tipado y no lo silencia', async () => {
    const request = vi.fn().mockRejectedValue(
      new AppError({
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas.',
        statusHttp: 401,
      }),
    );

    const apiClient = { request } as unknown as ApiClient;
    const service = new AuthService(apiClient);

    await expect(
      service.login({ email: 'ana@bank.test', password: 'wrong' }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      statusHttp: 401,
    });
  });

  it('register mapea RegisterUserOutputDTO sin token', async () => {
    const request = vi.fn().mockResolvedValue({
      id: 'user-2',
      email: 'bob@bank.test',
      fullName: 'Bob',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const apiClient = { request } as unknown as ApiClient;
    const service = new AuthService(apiClient);

    const result = await service.register({
      name: 'Bob',
      email: 'bob@bank.test',
      password: 'password123',
    });

    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Bob',
        email: 'bob@bank.test',
        password: 'password123',
      },
      auth: false,
    });
    expect(result).toEqual({
      id: 'user-2',
      email: 'bob@bank.test',
      fullName: 'Bob',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
