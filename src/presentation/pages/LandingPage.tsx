import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <main className="landing">
      <div className="landing__plane" aria-hidden="true" />
      <div className="landing__content">
        <p className="landing__signal" aria-hidden="true" />
        <h1 className="landing__brand">
          Fintech <em>Core</em>
        </h1>
        <p className="landing__lede">
          Banca operativa clara: cuentas, movimientos y control en un solo lugar.
        </p>
        <div className="actions">
          <Link className="button-link" to="/login">
            Iniciar sesión
          </Link>
          <Link className="button-link button-link--ghost" to="/register">
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
