import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Evita mostrar login/register si ya hay sesión (tras restore).
 */
export function GuestGuard() {
  const { status } = useAuth();

  if (status === 'unknown') {
    return (
      <div className="page page--center session-restore" role="status" aria-live="polite">
        <p className="session-restore__mark">Fintech Core</p>
        <p>Restaurando sesión…</p>
        <div className="session-restore__bar" aria-hidden="true" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
