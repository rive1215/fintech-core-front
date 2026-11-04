import { useState, type FormEvent } from 'react';
import { formatZodFieldErrors } from '../../../application/validation/authSchemas';
import { transferFormSchema } from '../../../application/validation/transactionSchemas';
import type { Account } from '../../../domain/entities/Account';
import type { AppError } from '../../../domain/errors/ApiErrorCode';
import type { TransferResult } from '../../../domain/ports/TransferApi';
import type { RemoteStatus } from '../../hooks/useAccount';
import { formatAccountBalance } from '../../format/money';
import { TransactionErrorBanner } from './TransactionErrorBanner';

export interface TransferFormProps {
  readonly sourceAccount: Account | null;
  readonly status: RemoteStatus;
  readonly error: AppError | null;
  readonly lastResult: TransferResult | null;
  readonly disabled: boolean;
  readonly onSubmit: (input: {
    destinationAccountId: string;
    amount: number;
    description?: string;
  }) => Promise<void>;
  readonly onClearError: () => void;
}

export function TransferForm({
  sourceAccount,
  status,
  error,
  lastResult,
  disabled,
  onSubmit,
  onClearError,
}: TransferFormProps) {
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    ReadonlyArray<{ field: string; message: string }>
  >([]);

  const submitting = status === 'loading';
  const sourceActive = sourceAccount?.status === 'ACTIVE';
  const formDisabled =
    disabled || submitting || sourceAccount === null || !sourceActive;

  function errorFor(field: string): string | undefined {
    return fieldErrors.find((item) => item.field === field)?.message;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onClearError();
    setFieldErrors([]);

    if (sourceAccount === null) {
      setFieldErrors([{ field: 'sourceAccountId', message: 'Selecciona una cuenta origen.' }]);
      return;
    }

    const parsed = transferFormSchema.safeParse({
      sourceAccountId: sourceAccount.id,
      destinationAccountId: destinationAccountId.trim(),
      amount,
      description: description.length === 0 ? undefined : description,
    });

    if (!parsed.success) {
      setFieldErrors(formatZodFieldErrors(parsed.error));
      return;
    }

    try {
      const payload: {
        destinationAccountId: string;
        amount: number;
        description?: string;
      } = {
        destinationAccountId: parsed.data.destinationAccountId,
        amount: parsed.data.amount,
      };
      if (parsed.data.description !== undefined) {
        payload.description = parsed.data.description;
      }
      await onSubmit(payload);
      setAmount('');
      setDescription('');
    } catch {
      // recuperable
    }
  }

  return (
    <section className="panel">
      <h2>Transferencia</h2>
      {sourceAccount === null ? (
        <p className="empty">Selecciona una cuenta origen ACTIVE.</p>
      ) : !sourceActive ? (
        <p className="empty">La cuenta origen debe estar ACTIVE.</p>
      ) : (
        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <p className="hint">
            Origen: {sourceAccount.accountNumber} ({sourceAccount.id})
          </p>
          <label className="field">
            <span>Cuenta destino (UUID)</span>
            <input
              type="text"
              name="destinationAccountId"
              value={destinationAccountId}
              disabled={formDisabled}
              onChange={(event) => setDestinationAccountId(event.target.value)}
            />
            {errorFor('destinationAccountId') !== undefined ? (
              <span className="field-error">{errorFor('destinationAccountId')}</span>
            ) : null}
          </label>
          <label className="field">
            <span>Monto</span>
            <input
              type="text"
              inputMode="decimal"
              name="transferAmount"
              value={amount}
              disabled={formDisabled}
              onChange={(event) => setAmount(event.target.value)}
            />
            {errorFor('amount') !== undefined ? (
              <span className="field-error">{errorFor('amount')}</span>
            ) : null}
          </label>
          <label className="field">
            <span>Descripción (opcional)</span>
            <input
              type="text"
              name="description"
              maxLength={100}
              value={description}
              disabled={formDisabled}
              onChange={(event) => setDescription(event.target.value)}
            />
            {errorFor('description') !== undefined ? (
              <span className="field-error">{errorFor('description')}</span>
            ) : null}
          </label>
          <button type="submit" disabled={formDisabled}>
            {submitting ? 'Procesando transferencia…' : 'Transferir'}
          </button>
        </form>
      )}
      {error !== null ? <TransactionErrorBanner error={error} /> : null}
      {lastResult !== null && status === 'success' ? (
        <div className="banner banner--success" role="status">
          Transferencia confirmada · {formatAccountBalance(lastResult.amount)} · tx{' '}
          {lastResult.transactionId}
        </div>
      ) : null}
    </section>
  );
}
