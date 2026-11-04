import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppDependencies } from '../../composition/createAppDependencies';
import type { AppError } from '../../domain/errors/ApiErrorCode';
import { normalizeError } from '../../domain/errors/normalizeError';
import type { UserPublic } from '../../domain/entities/User';
import type {
  LoginInput,
  LoginResult,
  RegisterUserInput,
  RegisterUserResult,
} from '../../domain/ports/AuthApi';
import type { AuthSessionStore } from '../../domain/ports/AuthSessionStore';
import { AuthContext } from './authContextInstance';
import type { AuthContextValue, AuthStatus, OperationStatus } from './authTypes';

export interface AuthProviderProps {
  readonly dependencies: AppDependencies;
  readonly children: ReactNode;
}

function readInitialSession(sessionStore: AuthSessionStore): {
  status: AuthStatus;
  user: UserPublic | null;
  accessToken: string | null;
} {
  const snapshot = sessionStore.getSession();
  if (snapshot === null) {
    return { status: 'anonymous', user: null, accessToken: null };
  }
  return {
    status: 'authenticated',
    user: snapshot.user,
    accessToken: snapshot.accessToken,
  };
}

/**
 * Sesión global de autenticación.
 * No almacena cuentas ni historial de transacciones.
 *
 * Restauración: lectura síncrona del StorageAdapter en el estado inicial
 * para no pintar rutas protegidas antes de conocer la sesión.
 */
export function AuthProvider({ dependencies, children }: AuthProviderProps) {
  const { sessionStore, apiClient, loginUseCase, registerUserUseCase } =
    dependencies;

  const initial = readInitialSession(sessionStore);
  const [status, setStatus] = useState<AuthStatus>(initial.status);
  const [user, setUser] = useState<UserPublic | null>(initial.user);
  const [accessToken, setAccessToken] = useState<string | null>(initial.accessToken);

  const [loginStatus, setLoginStatus] = useState<OperationStatus>('idle');
  const [loginError, setLoginError] = useState<AppError | null>(null);
  const [registerStatus, setRegisterStatus] = useState<OperationStatus>('idle');
  const [registerError, setRegisterError] = useState<AppError | null>(null);

  const clearSessionState = useCallback(() => {
    sessionStore.clear();
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
  }, [sessionStore]);

  useEffect(() => {
    apiClient.setUnauthorizedListener(() => {
      clearSessionState();
    });
    return () => {
      apiClient.setUnauthorizedListener(null);
    };
  }, [apiClient, clearSessionState]);

  const login = useCallback(
    async (input: LoginInput): Promise<LoginResult> => {
      setLoginStatus('loading');
      setLoginError(null);
      try {
        const result = await loginUseCase.execute(input);
        sessionStore.setSession({
          accessToken: result.accessToken,
          user: result.user,
        });
        setAccessToken(result.accessToken);
        setUser(result.user);
        setStatus('authenticated');
        setLoginStatus('success');
        return result;
      } catch (error: unknown) {
        const appError = normalizeError(error);
        setLoginError(appError);
        setLoginStatus('error');
        throw appError;
      }
    },
    [loginUseCase, sessionStore],
  );

  const register = useCallback(
    async (input: RegisterUserInput): Promise<RegisterUserResult> => {
      setRegisterStatus('loading');
      setRegisterError(null);
      try {
        const result = await registerUserUseCase.execute(input);
        // Register no emite token — la sesión permanece anonymous.
        setRegisterStatus('success');
        return result;
      } catch (error: unknown) {
        const appError = normalizeError(error);
        setRegisterError(appError);
        setRegisterStatus('error');
        throw appError;
      }
    },
    [registerUserUseCase],
  );

  const logout = useCallback(() => {
    clearSessionState();
    setLoginStatus('idle');
    setRegisterStatus('idle');
    setLoginError(null);
    setRegisterError(null);
  }, [clearSessionState]);

  const clearLoginError = useCallback(() => {
    setLoginError(null);
    if (loginStatus === 'error') {
      setLoginStatus('idle');
    }
  }, [loginStatus]);

  const clearRegisterError = useCallback(() => {
    setRegisterError(null);
    if (registerStatus === 'error') {
      setRegisterStatus('idle');
    }
  }, [registerStatus]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      isAuthenticated: status === 'authenticated',
      loginStatus,
      loginError,
      registerStatus,
      registerError,
      login,
      register,
      logout,
      clearLoginError,
      clearRegisterError,
    }),
    [
      status,
      user,
      accessToken,
      loginStatus,
      loginError,
      registerStatus,
      registerError,
      login,
      register,
      logout,
      clearLoginError,
      clearRegisterError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
