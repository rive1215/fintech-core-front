import { normalizeError } from '../../domain/errors/normalizeError';
import type { Account } from '../../domain/entities/Account';
import type { AccountApi, CreateAccountInput } from '../../domain/ports/AccountApi';
import { ApiClient } from '../http/apiClient';
import { mapAccount, mapAccountList } from './accountMappers';

/**
 * AccountService — sin React. Solo rutas documentadas de cuentas.
 */
export class AccountService implements AccountApi {
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async listAccounts(): Promise<ReadonlyArray<Account>> {
    try {
      const data = await this.apiClient.request<unknown>({
        method: 'GET',
        path: '/api/accounts',
        auth: true,
      });
      return mapAccountList(data);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }

  async createAccount(input: CreateAccountInput): Promise<Account> {
    try {
      const body: { initialBalance?: number } = {};
      if (input.initialBalance !== undefined) {
        body.initialBalance = input.initialBalance;
      }
      // Nunca enviar userId — el JWT define el propietario.
      const data = await this.apiClient.request<unknown>({
        method: 'POST',
        path: '/api/accounts',
        body,
        auth: true,
      });
      return mapAccount(data);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }

  async getBalance(accountId: string): Promise<Account> {
    try {
      if (accountId.length === 0) {
        throw normalizeError({
          code: 'VALIDATION_ERROR',
          message: 'El parámetro accountId es requerido.',
          statusHttp: 400,
        });
      }
      const data = await this.apiClient.request<unknown>({
        method: 'GET',
        path: `/api/accounts/${encodeURIComponent(accountId)}/balance`,
        auth: true,
      });
      return mapAccount(data);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }

  async freeze(accountId: string): Promise<Account> {
    try {
      if (accountId.length === 0) {
        throw normalizeError({
          code: 'VALIDATION_ERROR',
          message: 'El parámetro accountId es requerido.',
          statusHttp: 400,
        });
      }
      const data = await this.apiClient.request<unknown>({
        method: 'PATCH',
        path: `/api/accounts/${encodeURIComponent(accountId)}/freeze`,
        auth: true,
      });
      return mapAccount(data);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }

  async unfreeze(accountId: string): Promise<Account> {
    try {
      if (accountId.length === 0) {
        throw normalizeError({
          code: 'VALIDATION_ERROR',
          message: 'El parámetro accountId es requerido.',
          statusHttp: 400,
        });
      }
      const data = await this.apiClient.request<unknown>({
        method: 'PATCH',
        path: `/api/accounts/${encodeURIComponent(accountId)}/unfreeze`,
        auth: true,
      });
      return mapAccount(data);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
