/**
 * Cuenta bancaria (AccountOutputDTO).
 * Fuente: docs/frontend/backend-contract.md
 *
 * [PENDIENTE] Forma wire exacta de `balance` (Decimal en backend).
 * Se tipa como string | number de forma defensiva hasta confirmar runtime.
 */
export type AccountStatus = 'ACTIVE' | 'FROZEN';

export type AccountBalance = string | number;

export interface Account {
  readonly id: string;
  readonly accountNumber: string;
  readonly balance: AccountBalance;
  readonly status: AccountStatus;
  readonly userId: string;
  readonly createdAt: string;
}
