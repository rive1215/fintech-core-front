import type { AccountBalance } from '../../domain/entities/Account';

/**
 * Formato de presentación únicamente.
 * No altera ni recalcula el valor; la precisión es del backend.
 */
export function formatAccountBalance(balance: AccountBalance): string {
  if (typeof balance === 'string') {
    const asNumber = Number(balance);
    if (Number.isFinite(asNumber)) {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(asNumber);
    }
    return balance;
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(balance);
}
