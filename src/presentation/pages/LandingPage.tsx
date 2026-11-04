import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <main className="page">
      <h1>Fintech Core</h1>
      <p className="lede">Scaffold con autenticación y rutas protegidas.</p>
      <div className="actions">
        <Link className="button-link" to="/login">
          Iniciar sesión
        </Link>
        <Link className="button-link button-link--ghost" to="/register">
          Registrarse
        </Link>
      </div>
    </main>
  );
}
