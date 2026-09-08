import type { ReservationStatus } from '@/types';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  success: 'bg-forest-100 text-forest-700',
  warning: 'bg-paper-200 text-paper-500',
  danger: 'bg-terra-100 text-terra-700',
  info: 'bg-forest-50 text-forest-600',
};

export function Badge({
  variant = 'neutral',
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

const statusConfig: Record<ReservationStatus, { variant: BadgeVariant; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pending' },
  ACTIVE: { variant: 'success', label: 'Active' },
  RETURNED: { variant: 'neutral', label: 'Returned' },
  EXPIRED: { variant: 'danger', label: 'Expired' },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
