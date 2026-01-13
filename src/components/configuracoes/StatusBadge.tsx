import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserStatus, IntegrationStatus, SubscriptionStatus, InvoiceStatus } from '@/types/settings';

type StatusType = UserStatus | IntegrationStatus | SubscriptionStatus | InvoiceStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // User status
  active: {
    label: 'Ativo',
    className: 'bg-success/20 text-success border-success/30',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  disabled: {
    label: 'Desativado',
    className: 'bg-muted/50 text-muted-foreground border-muted',
  },
  // Integration status
  connected: {
    label: 'Conectado',
    className: 'bg-success/20 text-success border-success/30',
  },
  disconnected: {
    label: 'Desconectado',
    className: 'bg-muted/50 text-muted-foreground border-muted',
  },
  error: {
    label: 'Erro',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
  // Subscription status
  trialing: {
    label: 'Trial',
    className: 'bg-info/20 text-info border-info/30',
  },
  past_due: {
    label: 'Atrasado',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
  canceled: {
    label: 'Cancelado',
    className: 'bg-muted/50 text-muted-foreground border-muted',
  },
  // Invoice status
  paid: {
    label: 'Pago',
    className: 'bg-success/20 text-success border-success/30',
  },
  open: {
    label: 'Aberto',
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  void: {
    label: 'Anulado',
    className: 'bg-muted/50 text-muted-foreground border-muted',
  },
  uncollectible: {
    label: 'Incobrável',
    className: 'bg-destructive/20 text-destructive border-destructive/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
