import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  formatZodFieldErrors,
  registerFormSchema,
} from '../../application/validation/authSchemas';
import { AppError } from '../../domain/errors/ApiErrorCode';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, registerStatus, registerError, clearRegisterError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    ReadonlyArray<{ field: string; message: string }>
  >([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitting = registerStatus === 'loading';

  const serverFieldErrors = useMemo(() => {
    if (registerError === null) {
      return [];
    }
    return registerError.fieldErrors;
  }, [registerError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearRegisterError();
    setFieldErrors([]);
    setSuccessMessage(null);

    const parsed = registerFormSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setFieldErrors(formatZodFieldErrors(parsed.error));
      return;
    }

    try {
      const result = await register(parsed.data);
      setSuccessMessage(
        `Cuenta creada para ${result.email}. Ahora puedes iniciar sesión.`,
      );
      void navigate('/login', { replace: true });
    } catch (error: unknown) {
      if (!(error instanceof AppError)) {
        setFieldErrors([{ field: 'form', message: 'No se pudo completar el registro.' }]);
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
      <p className="brand-kicker">
        Fintech <span>Core</span>
      </p>
      <h1>Registro</h1>
      <p className="lede">Crea tu usuario. El registro no inicia sesión automáticamente.</p>

      <div className="auth-shell">
        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <label className="field">
            <span>Nombre completo</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              disabled={submitting}
              onChange={(event) => setName(event.target.value)}
            />
            {errorFor('name') !== undefined ? (
              <span className="field-error">{errorFor('name')}</span>
            ) : null}
          </label>

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
              autoComplete="new-password"
              value={password}
              disabled={submitting}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errorFor('password') !== undefined ? (
              <span className="field-error">{errorFor('password')}</span>
            ) : null}
          </label>

          {registerError !== null ? (
            <div className="banner banner--error" role="alert">
              <strong>{registerError.code}</strong>
              <span>{registerError.message}</span>
            </div>
          ) : null}

          {successMessage !== null ? (
            <div className="banner banner--success" role="status">
              {successMessage}
            </div>
          ) : null}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Registrando…' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </main>
  );
}
