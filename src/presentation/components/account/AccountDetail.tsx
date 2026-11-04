import type { Account } from '../../../domain/entities/Account';
import type { AppError } from '../../../domain/errors/ApiErrorCode';
import type { RemoteStatus } from '../../hooks/useAccount';
import { formatAccountBalance } from '../../format/money';
import { AccountStatusBadge } from './AccountStatusBadge';

export interface AccountDetailProps {
  readonly account: Account | null;
  readonly status: RemoteStatus;
  readonly error: AppError | null;
  readonly onRetry: () => void;
}

export function AccountDetail({ account, status, error, onRetry }: AccountDetailProps) {
  if (status === 'idle') {
    return (
      <section className="panel">
        <h2>Detalle</h2>
        <p className="empty">Selecciona una cuenta para ver el saldo.</p>
      </section>
    );
  }

  if (status === 'loading') {
    return (
      <section className="panel" aria-busy="true">
        <h2>Detalle</h2>
        <p>Cargando detalle…</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="panel">
        <h2>Detalle</h2>
        <div className="banner banner--error" role="alert">
          <strong>{error?.code ?? 'ERROR'}</strong>
          <span>{error?.message ?? 'No se pudo cargar el detalle.'}</span>
        </div>
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      </section>
    );
  }

  if (account === null) {
    return (
      <section className="panel">
        <h2>Detalle</h2>
        <p className="empty">Sin detalle disponible.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Detalle</h2>
      <dl className="detail-grid">
        <div>
          <dt>Número</dt>
          <dd>{account.accountNumber}</dd>
        </div>
        <div>
          <dt>Saldo</dt>
          <dd>{formatAccountBalance(account.balance)}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <AccountStatusBadge status={account.status} />
          </dd>
        </div>
        <div>
          <dt>Creada</dt>
          <dd>{account.createdAt}</dd>
        </div>
        <div>
          <dt>ID</dt>
          <dd className="mono">{account.id}</dd>
        </div>
      </dl>
    </section>
  );
}
