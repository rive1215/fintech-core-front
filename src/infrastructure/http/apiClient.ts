import type { AppConfig } from '../../config/env';
import type { AuthSessionStore } from '../../domain/ports/AuthSessionStore';
import { appErrorFromApiBody } from '../../domain/errors/normalizeError';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface ApiRequest {
  readonly method: HttpMethod;
  readonly path: string;
  readonly body?: unknown;
  /** Si true, adjunta Bearer desde AuthSessionStore. */
  readonly auth?: boolean;
}

export interface ApiSuccessEnvelope<T> {
  readonly status: 'success';
  readonly data: T;
  readonly message?: string;
}

export type UnauthorizedListener = () => void;

/**
 * Cliente HTTP (fetch) con configuración e interceptor de 401 autenticado.
 * La UI no importa este módulo; solo infrastructure / composition.
 *
 * Nota: no se usa Axios; el patrón de “interceptor” vive aquí con fetch.
 */
export class ApiClient {
  private readonly config: AppConfig;
  private readonly sessionStore: AuthSessionStore;
  private unauthorizedListener: UnauthorizedListener | null = null;

  constructor(config: AppConfig, sessionStore: AuthSessionStore) {
    this.config = config;
    this.sessionStore = sessionStore;
  }

  /**
   * Registra el manejador global de sesión inválida (401 en requests con auth).
   * AuthProvider lo usa para no duplicar lógica en cada página.
   */
  setUnauthorizedListener(listener: UnauthorizedListener | null): void {
    this.unauthorizedListener = listener;
  }

  async request<T>(request: ApiRequest): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (request.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const withAuth = request.auth === true;
    if (withAuth) {
      const token = this.sessionStore.getAccessToken();
      if (token !== null && token.length > 0) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const init: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.body !== undefined) {
      init.body = JSON.stringify(request.body);
    }

    let response: Response;
    try {
      response = await fetch(`${this.config.apiBaseUrl}${request.path}`, init);
    } catch (error: unknown) {
      throw appErrorFromApiBody(0, {
        code: 'UNKNOWN',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo conectar con el servidor.',
      });
    }

    const text = await response.text();
    let body: unknown = null;
    if (text.length > 0) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = text;
      }
    }

    if (
      withAuth &&
      response.status === 401 &&
      this.unauthorizedListener !== null
    ) {
      this.unauthorizedListener();
    }

    if (!response.ok) {
      throw appErrorFromApiBody(response.status, body);
    }

    if (
      typeof body === 'object' &&
      body !== null &&
      'status' in body &&
      (body as { status: unknown }).status === 'success' &&
      'data' in body
    ) {
      return (body as ApiSuccessEnvelope<T>).data;
    }

    throw appErrorFromApiBody(response.status, {
      code: 'UNKNOWN',
      message: 'Respuesta del servidor con formato inesperado.',
    });
  }
}
