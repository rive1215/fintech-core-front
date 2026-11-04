import type { AccountStatus } from '../../../domain/entities/Account';

export interface AccountStatusBadgeProps {
  readonly status: AccountStatus;
}

export function AccountStatusBadge({ status }: AccountStatusBadgeProps) {
  const className =
    status === 'ACTIVE' ? 'status-badge status-badge--active' : 'status-badge status-badge--frozen';
  return <span className={className}>{status}</span>;
}
