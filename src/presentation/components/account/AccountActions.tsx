import type { Account } from '../../../domain/entities/Account';
import type { AppError } from '../../../domain/errors/ApiErrorCode';
import type { RemoteStatus } from '../../hooks/useAccount';

export interface AccountActionsProps {
  readonly account: Account | null;
  readonly mutationStatus: RemoteStatus;
  readonly mutationError: AppError | null;
  readonly onFreeze: () => void;
  readonly onUnfreeze: () => void;
}

/**
 * Solo habilita freeze/unfreeze según estado de la cuenta del listado propio
 * (ownership UI) y precondiciones del contrato ACTIVE ↔ FROZEN.
 */
export function AccountActions({
  account,
  mutationStatus,
  mutationError,
  onFreeze,
  onUnfreeze,
}: AccountActionsProps) {
  const busy = mutationStatus === 'loading';
  const canFreeze = account !== null && account.status === 'ACTIVE';
  const canUnfreeze = account !== null && account.status === 'FROZEN';

  return (
    <section className="panel">
      <h2>Acciones</h2>
      {account === null ? (
        <p className="empty">Selecciona una cuenta para operar.</p>
      ) : (
        <div className="actions">
          <button type="button" disabled={!canFreeze || busy} onClick={onFreeze}>
            Congelar
          </button>
          <button type="button" disabled={!canUnfreeze || busy} onClick={onUnfreeze}>
            Descongelar
          </button>
        </div>
      )}
      {mutationError !== null ? (
        <div className="banner banner--error" role="alert">
          <strong>{mutationError.code}</strong>
          <span>{mutationError.message}</span>
        </div>
      ) : null}
      {mutationStatus === 'success' ? (
        <p className="hint" role="status">
          Operación confirmada. Datos refrescados desde el servidor.
        </p>
      ) : null}
    </section>
  );
}
