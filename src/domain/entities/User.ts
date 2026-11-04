/**
 * Usuario público expuesto por login (LoginOutputDTO.user).
 * Fuente: docs/frontend/backend-contract.md
 */
export interface UserPublic {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
}
