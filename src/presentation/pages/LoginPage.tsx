import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  formatZodFieldErrors,
  loginFormSchema,
} from '../../application/validation/authSchemas';
import { AppError } from '../../domain/errors/ApiErrorCode';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, loginError, clearLoginError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ReadonlyArray<{ field: string; message: string }>>(
    [],
  );

  const submitting = loginStatus === 'loading';

  const serverFieldErrors = useMemo(() => {
    if (loginError === null) {
      return [];
    }
    return loginError.fieldErrors;
  }, [loginError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearLoginError();
    setFieldErrors([]);

    const parsed = loginFormSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(formatZodFieldErrors(parsed.error));
      return;
    }

    try {
      await login(parsed.data);
      void navigate('/app', { replace: true });
    } catch (error: unknown) {
      if (!(error instanceof AppError)) {
        // useAuth ya normaliza; defensivo
        setFieldErrors([{ field: 'form', message: 'No se pudo iniciar sesión.' }]);
      }
    }
  }

  function errorFor(field: string): string | undefined {
    const local = fieldErrors.find((item) => item.field === field);
    if (local !== undefined) {
      return local.message;
    }
    const server = serverFieldErrors.find((item) => item.field === field);
    return server?.message;
  }

  return (
    <main className="page auth-page">
      <h1>Iniciar sesión</h1>
      <p className="lede">Accede con el correo y contraseña registrados.</p>

      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <label className="field">
          <span>Correo</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            disabled={submitting}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errorFor('email') !== undefined ? (
            <span className="field-error">{errorFor('email')}</span>
          ) : null}
        </label>

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            disabled={submitting}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errorFor('password') !== undefined ? (
            <span className="field-error">{errorFor('password')}</span>
          ) : null}
        </label>

        {loginError !== null ? (
          <div className="banner banner--error" role="alert">
            <strong>{loginError.code}</strong>
            <span>{loginError.message}</span>
          </div>
        ) : null}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="auth-switch">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </main>
  );
}
