import type { UserPublic } from '../../../domain/entities/User';

export interface DashboardSummaryProps {
  readonly user: UserPublic | null;
  readonly accountCount: number;
  readonly onRefresh: () => void;
  readonly onLogout: () => void;
  readonly refreshing: boolean;
}

export function DashboardSummary({
  user,
  accountCount,
  onRefresh,
  onLogout,
  refreshing,
}: DashboardSummaryProps) {
  return (
    <header className="dashboard-summary">
      <div>
        <p className="brand-inline">Fintech Core</p>
        <h1>Operaciones</h1>
        <p className="lede">
          {user !== null ? `${user.fullName} · ${user.email}` : 'Sesión autenticada'}
          {' · '}
          {accountCount} cuenta{accountCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="actions">
        <button type="button" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? 'Actualizando…' : 'Refrescar'}
        </button>
        <button type="button" className="button-secondary" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
