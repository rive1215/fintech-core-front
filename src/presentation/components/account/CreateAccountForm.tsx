import { useState, type FormEvent } from 'react';
import { createAccountFormSchema } from '../../../application/validation/accountSchemas';
import type { AppError } from '../../../domain/errors/ApiErrorCode';
import type { Account } from '../../../domain/entities/Account';
import type { RemoteStatus } from '../../hooks/useAccount';
import { formatAccountBalance } from '../../format/money';

export interface CreateAccountFormProps {
  readonly status: RemoteStatus;
  readonly error: AppError | null;
  readonly lastCreated: Account | null;
  readonly onSubmit: (initialBalance?: number) => Promise<void>;
}

export function CreateAccountForm({
  status,
  error,
  lastCreated,
  onSubmit,
}: CreateAccountFormProps) {
  const [initialBalance, setInitialBalance] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const submitting = status === 'loading';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    const parsed = createAccountFormSchema.safeParse({
      initialBalance,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setFieldError(first?.message ?? 'Datos inválidos');
      return;
    }

    await onSubmit(parsed.data.initialBalance);
    setInitialBalance('');
  }

  return (
    <section className="panel">
      <h2>Crear cuenta</h2>
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <label className="field">
          <span>Saldo inicial (opcional)</span>
          <input
            type="text"
            inputMode="decimal"
            name="initialBalance"
            value={initialBalance}
            disabled={submitting}
            placeholder="0"
            onChange={(event) => setInitialBalance(event.target.value)}
          />
          {fieldError !== null ? <span className="field-error">{fieldError}</span> : null}
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
      {error !== null ? (
        <div className="banner banner--error" role="alert">
          <strong>{error.code}</strong>
          <span>{error.message}</span>
        </div>
      ) : null}
      {lastCreated !== null && status === 'success' ? (
        <div className="banner banner--success" role="status">
          Cuenta {lastCreated.accountNumber} creada · saldo{' '}
          {formatAccountBalance(lastCreated.balance)}
        </div>
      ) : null}
    </section>
  );
}
