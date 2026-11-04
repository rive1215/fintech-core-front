import type {
  AuthApi,
  LoginInput,
  LoginResult,
  RegisterUserInput,
  RegisterUserResult,
} from '../../domain/ports/AuthApi';
import type { UserPublic } from '../../domain/entities/User';
import { AppError } from '../../domain/errors/ApiErrorCode';
import { normalizeError } from '../../domain/errors/normalizeError';
import { ApiClient } from '../http/apiClient';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseUserPublic(value: unknown): UserPublic {
  if (!isRecord(value)) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Usuario de respuesta inválido.',
      statusHttp: 500,
    });
  }
  const { id, email, fullName } = value;
  if (
    typeof id !== 'string' ||
    typeof email !== 'string' ||
    typeof fullName !== 'string'
  ) {
    throw new AppError({
      code: 'UNKNOWN',
      message: 'Usuario de respuesta inválido.',
      statusHttp: 500,
    });
  }
  return { id, email, fullName };
}

/**
 * AuthService — sin React. Habla solo con el contrato HTTP documentado.
 * Rutas: POST /api/auth/register, POST /api/auth/login.
 */
export class AuthService implements AuthApi {
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async register(input: RegisterUserInput): Promise<RegisterUserResult> {
    try {
      const data = await this.apiClient.request<unknown>({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
        auth: false,
      });

      if (!isRecord(data)) {
        throw new AppError({
          code: 'UNKNOWN',
          message: 'Respuesta de registro inválida.',
          statusHttp: 500,
        });
      }

      const user = parseUserPublic({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
      });

      if (typeof data.createdAt !== 'string') {
        throw new AppError({
          code: 'UNKNOWN',
          message: 'Respuesta de registro inválida.',
          statusHttp: 500,
        });
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: data.createdAt,
      };
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }

  async login(input: LoginInput): Promise<LoginResult> {
    try {
      const data = await this.apiClient.request<unknown>({
        method: 'POST',
        path: '/api/auth/login',
        body: {
          email: input.email,
          password: input.password,
        },
        auth: false,
      });

      if (!isRecord(data) || typeof data.accessToken !== 'string') {
        throw new AppError({
          code: 'UNKNOWN',
          message: 'Respuesta de login inválida.',
          statusHttp: 500,
        });
      }

      const user = parseUserPublic(data.user);

      return {
        accessToken: data.accessToken,
        user,
      };
    } catch (error: unknown) {
      throw normalizeError(error);
    }
  }
}
