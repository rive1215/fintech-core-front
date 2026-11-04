import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Evita mostrar login/register si ya hay sesión (tras restore).
 */
export function GuestGuard() {
  const { status } = useAuth();

  if (status === 'unknown') {
    return (
      <div className="page page--center" role="status" aria-live="polite">
        <p>Restaurando sesión…</p>
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
