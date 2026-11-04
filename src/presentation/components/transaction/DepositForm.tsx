import { useState, type FormEvent } from 'react';
import { depositFormSchema } from '../../../application/validation/transactionSchemas';
import type { Account } from '../../../domain/entities/Account';
import type { AppError } from '../../../domain/errors/ApiErrorCode';
import type { DepositResult } from '../../../domain/ports/TransactionFundsApi';
import type { RemoteStatus } from '../../hooks/useAccount';
import { formatAccountBalance } from '../../format/money';
import { TransactionErrorBanner } from './TransactionErrorBanner';

export interface DepositFormProps {
  readonly account: Account | null;
  readonly status: RemoteStatus;
  readonly error: AppError | null;
  readonly lastResult: DepositResult | null;
  readonly disabled: boolean;
  readonly onSubmit: (amount: number) => Promise<void>;
  readonly onClearError: () => void;
}

export function DepositForm({
  account,
  status,
  error,
  lastResult,
  disabled,
  onSubmit,
  onClearError,
}: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const submitting = status === 'loading';
  const accountActive = account?.status === 'ACTIVE';
  const formDisabled = disabled || submitting || account === null || !accountActive;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onClearError();
    setFieldError(null);

    if (account === null) {
      setFieldError('Selecciona una cuenta ACTIVE.');
      return;
    }

    const parsed = depositFormSchema.safeParse({
      accountId: account.id,
      amount,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setFieldError(first?.message ?? 'Datos inválidos');
      return;
    }

    try {
      await onSubmit(parsed.data.amount);
      setAmount('');
    } catch {
      // error tipado ya en el hook; formulario recuperable
    }
  }

  return (
    <section className="panel">
      <h2>Depósito</h2>
      {account === null ? (
        <p className="empty">Selecciona una cuenta.</p>
      ) : !accountActive ? (
        <p className="empty">La cuenta debe estar ACTIVE para depositar.</p>
      ) : (
        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <label className="field">
            <span>Monto</span>
            <input
              type="text"
              inputMode="decimal"
              name="depositAmount"
              value={amount}
              disabled={formDisabled}
              onChange={(event) => setAmount(event.target.value)}
            />
            {fieldError !== null ? <span className="field-error">{fieldError}</span> : null}
          </label>
          <button type="submit" disabled={formDisabled}>
            {submitting ? 'Procesando…' : 'Depositar'}
          </button>
        </form>
      )}
      {error !== null ? <TransactionErrorBanner error={error} /> : null}
      {lastResult !== null && status === 'success' ? (
        <div className="banner banner--success" role="status">
          Depósito confirmado · {formatAccountBalance(lastResult.amount)} · tx{' '}
          {lastResult.transactionId}
        </div>
      ) : null}
    </section>
  );
}
