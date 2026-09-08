import type { ReactNode } from 'react';
import { AlertCircle, Info, XCircle, CheckCircle } from 'lucide-react';

type AlertVariant = 'error' | 'warning' | 'info' | 'success';

const config: Record<AlertVariant, { icon: typeof AlertCircle; classes: string }> = {
  error: { icon: XCircle, classes: 'bg-terra-50 border-terra-200 text-terra-800' },
  warning: { icon: AlertCircle, classes: 'bg-paper-100 border-paper-300 text-ink-700' },
  info: { icon: Info, classes: 'bg-forest-50 border-forest-200 text-forest-800' },
  success: { icon: CheckCircle, classes: 'bg-forest-50 border-forest-200 text-forest-800' },
};

export function Alert({
  variant = 'info',
  children,
}: {
  variant?: AlertVariant;
  children: ReactNode;
}) {
  const { icon: Icon, classes } = config[variant];
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${classes}`}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}
