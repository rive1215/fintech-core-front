import type { AppError } from '../../domain/errors/ApiErrorCode';
import type { UserPublic } from '../../domain/entities/User';
import type {
  LoginInput,
  LoginResult,
  RegisterUserInput,
  RegisterUserResult,
} from '../../domain/ports/AuthApi';

export type AuthStatus = 'anonymous' | 'authenticated' | 'unknown';

export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AuthContextValue {
  readonly status: AuthStatus;
  readonly user: UserPublic | null;
  readonly accessToken: string | null;
  readonly isAuthenticated: boolean;

  readonly loginStatus: OperationStatus;
  readonly loginError: AppError | null;
  readonly registerStatus: OperationStatus;
  readonly registerError: AppError | null;

  login: (input: LoginInput) => Promise<LoginResult>;
  register: (input: RegisterUserInput) => Promise<RegisterUserResult>;
  logout: () => void;
  clearLoginError: () => void;
  clearRegisterError: () => void;
}
