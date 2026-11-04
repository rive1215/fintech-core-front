import type { AppError } from '../../../domain/errors/ApiErrorCode';

export interface TransactionErrorBannerProps {
  readonly error: AppError;
}

/**
 * Separa por `code` documentado: validación, fondos, congelada, no encontrada, red.
 */
export function TransactionErrorBanner({ error }: TransactionErrorBannerProps) {
  const title = titleForCode(error.code, error.statusHttp);

  return (
    <div className="banner banner--error" role="alert">
      <strong>
        {title} ({error.code})
      </strong>
      <span>{error.message}</span>
      {error.fieldErrors.length > 0 ? (
        <ul className="error-list">
          {error.fieldErrors.map((fieldError) => (
            <li key={`${fieldError.field}:${fieldError.message}`}>
              {fieldError.field}: {fieldError.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function titleForCode(code: AppError['code'], statusHttp: number): string {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 'Error de validación';
    case 'INSUFFICIENT_FUNDS':
      return 'Saldo insuficiente';
    case 'ACCOUNT_FROZEN':
      return 'Cuenta congelada';
    case 'ACCOUNT_NOT_FOUND':
      return 'Cuenta no encontrada';
    case 'INVALID_AMOUNT':
      return 'Monto inválido';
    case 'DOMAIN_VALIDATION_ERROR':
      return 'Regla de dominio';
    case 'UNKNOWN':
      return statusHttp === 0 ? 'Error de red' : 'Error';
    default:
      return 'Error de operación';
  }
}
