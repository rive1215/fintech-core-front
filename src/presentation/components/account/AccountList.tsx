import type { Account } from '../../../domain/entities/Account';
import type { RemoteStatus } from '../../hooks/useAccount';
import { formatAccountBalance } from '../../format/money';
import type { AppError } from '../../../domain/errors/ApiErrorCode';

export interface AccountListProps {
  readonly accounts: ReadonlyArray<Account>;
  readonly selectedAccountId: string | null;
  readonly status: RemoteStatus;
  readonly error: AppError | null;
  readonly onSelect: (accountId: string) => void;
  readonly onRetry: () => void;
}

export function AccountList({
  accounts,
  selectedAccountId,
  status,
  error,
  onSelect,
  onRetry,
}: AccountListProps) {
  if (status === 'loading' || status === 'idle') {
    return (
      <section className="panel" aria-busy="true">
        <h2>Cuentas</h2>
        <p>Cargando cuentas…</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="panel">
        <h2>Cuentas</h2>
        <div className="banner banner--error" role="alert">
          <strong>{error?.code ?? 'ERROR'}</strong>
          <span>{error?.message ?? 'No se pudieron cargar las cuentas.'}</span>
        </div>
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      </section>
    );
  }

  if (status === 'empty') {
    return (
      <section className="panel">
        <h2>Cuentas</h2>
        <p className="empty">Aún no tienes cuentas. Crea la primera abajo.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Cuentas</h2>
      <ul className="account-list">
        {accounts.map((account) => {
          const selected = account.id === selectedAccountId;
          return (
            <li key={account.id}>
              <button
                type="button"
                className={selected ? 'account-item account-item--selected' : 'account-item'}
                onClick={() => onSelect(account.id)}
              >
                <span className="account-item__number">{account.accountNumber}</span>
                <span className="account-item__meta">
                  {formatAccountBalance(account.balance)} · {account.status}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
