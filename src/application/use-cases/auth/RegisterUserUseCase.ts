import { normalizeError } from '../../../domain/errors/normalizeError';
import type {
  AuthApi,
  RegisterUserInput,
  RegisterUserResult,
} from '../../../domain/ports/AuthApi';

/**
 * Caso de uso FE: registro. No emite sesión (el backend no devuelve token).
 */
export class RegisterUserUseCase {
  private readonly authApi: AuthApi;

  constructor(authApi: AuthApi) {
    this.authApi = authApi;
  }

  async execute(input: RegisterUserInput): Promise<RegisterUserResult> {
    try {
      return await this.authApi.register(input);
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
