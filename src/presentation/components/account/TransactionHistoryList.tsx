import type { TransactionHistoryItem } from '../../../domain/entities/Transaction';
import type { AppError } from '../../../domain/errors/ApiErrorCode';
import type { RemoteStatus } from '../../hooks/useAccount';
import { formatAccountBalance } from '../../format/money';

export interface TransactionHistoryListProps {
  readonly items: ReadonlyArray<TransactionHistoryItem>;
  readonly status: RemoteStatus;
  readonly error: AppError | null;
  readonly onRetry: () => void;
}

export function TransactionHistoryList({
  items,
  status,
  error,
  onRetry,
}: TransactionHistoryListProps) {
  if (status === 'idle') {
    return (
      <section className="panel">
        <h2>Historial</h2>
        <p className="empty">Selecciona una cuenta para ver el historial.</p>
      </section>
    );
  }

  if (status === 'loading') {
    return (
      <section className="panel" aria-busy="true">
        <h2>Historial</h2>
        <p>Cargando historial…</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="panel">
        <h2>Historial</h2>
        <div className="banner banner--error" role="alert">
          <strong>{error?.code ?? 'ERROR'}</strong>
          <span>{error?.message ?? 'No se pudo cargar el historial.'}</span>
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
        <h2>Historial</h2>
        <p className="empty">Esta cuenta aún no tiene movimientos.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Historial</h2>
      <ul className="history-list">
        {items.map((item) => (
          <li key={item.id} className="history-item">
            <div className="history-item__top">
              <strong>{item.type}</strong>
              <span>{formatAccountBalance(item.amount)}</span>
            </div>
            <div className="history-item__meta">
              {item.status} · {item.createdAt}
            </div>
            <p className="history-item__desc">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
