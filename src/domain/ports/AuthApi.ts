import type { UserPublic } from '../entities/User';

/**
 * Puerto Auth — operaciones documentadas en backend-contract.md.
 * Las implementaciones viven en infrastructure; no se cablean en este scaffold.
 */
export interface RegisterUserInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface RegisterUserResult {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly createdAt: string;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface LoginResult {
  readonly accessToken: string;
  readonly user: UserPublic;
}

export interface AuthApi {
  register(input: RegisterUserInput): Promise<RegisterUserResult>;
  login(input: LoginInput): Promise<LoginResult>;
}
