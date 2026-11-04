import type { UserPublic } from '../entities/User';

/**
 * Snapshot de sesión autenticada (token + usuario público de login).
 * Persistencia solo en infrastructure.
 */
export interface AuthSessionSnapshot {
  readonly accessToken: string;
  readonly user: UserPublic;
}

/**
 * Puerto de almacenamiento de sesión.
 * Implementación didáctica: localStorage (ver LocalStorageSessionStore).
 * Alternativa de producción: cookie HttpOnly + endpoint de sesión en backend.
 */
export interface AuthSessionStore {
  getSession(): AuthSessionSnapshot | null;
  setSession(session: AuthSessionSnapshot): void;
  getAccessToken(): string | null;
  clear(): void;
}
