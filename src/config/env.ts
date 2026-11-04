/**
 * Configuración externa consumida por infrastructure.
 * No contiene lógica de negocio ni React.
 */
export interface AppConfig {
  readonly apiBaseUrl: string;
}

function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL;
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.replace(/\/$/, '');
  }
  // Default alineado a docs/frontend/backend-contract.md (PORT ?? 3000).
  return 'http://localhost:3000';
}

export const appConfig: AppConfig = {
  apiBaseUrl: readApiBaseUrl(),
};
