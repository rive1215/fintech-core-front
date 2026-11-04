import type { UserPublic } from '../../domain/entities/User';
import type {
  AuthSessionSnapshot,
  AuthSessionStore,
} from '../../domain/ports/AuthSessionStore';

const STORAGE_KEY = 'fintech-core.auth.session';

function isUserPublic(value: unknown): value is UserPublic {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.email === 'string' &&
    typeof record.fullName === 'string'
  );
}

/**
 * StorageAdapter de sesión con localStorage (decisión didáctica del Prompt 4).
 *
 * Alternativa recomendada en producción: cookie **HttpOnly** + **Secure**
 * emitida por el backend (el JS no leería el token; reduce XSS token theft).
 * Requiere soporte de cookie/sesión en la API, no observado hoy en el contrato.
 */
export class LocalStorageSessionStore implements AuthSessionStore {
  getSession(): AuthSessionSnapshot | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null || raw.length === 0) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        return null;
      }
      const record = parsed as Record<string, unknown>;
      if (typeof record.accessToken !== 'string' || record.accessToken.length === 0) {
        return null;
      }
      if (!isUserPublic(record.user)) {
        return null;
      }
      return {
        accessToken: record.accessToken,
        user: {
          id: record.user.id,
          email: record.user.email,
          fullName: record.user.fullName,
        },
      };
    } catch {
      return null;
    }
  }

  setSession(session: AuthSessionSnapshot): void {
    const payload: AuthSessionSnapshot = {
      accessToken: session.accessToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.fullName,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
