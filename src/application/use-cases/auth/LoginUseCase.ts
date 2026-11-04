import { normalizeError } from '../../../domain/errors/normalizeError';
import type { AuthApi, LoginInput, LoginResult } from '../../../domain/ports/AuthApi';

/**
 * Caso de uso FE: login. Depende del puerto AuthApi (no de React ni storage).
 */
export class LoginUseCase {
  private readonly authApi: AuthApi;

  constructor(authApi: AuthApi) {
    this.authApi = authApi;
  }

  async execute(input: LoginInput): Promise<LoginResult> {
    try {
      return await this.authApi.login(input);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
