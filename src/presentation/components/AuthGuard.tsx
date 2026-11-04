import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Protege rutas hijas: espera restauración de sesión y redirige a /login
 * si no hay sesión. No renderiza contenido protegido mientras status === unknown.
 */
export function AuthGuard() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'unknown') {
    return (
      <div className="page page--center session-restore" role="status" aria-live="polite">
        <p className="session-restore__mark">Fintech Core</p>
        <p>Restaurando sesión…</p>
        <div className="session-restore__bar" aria-hidden="true" />
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
