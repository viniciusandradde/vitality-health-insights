import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AppRole } from '@/types/settings';

interface RoleBadgeProps {
  role: AppRole;
  className?: string;
}

const roleConfig: Record<AppRole, { label: string; className: string }> = {
  master: {
    label: 'Master',
    className: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  },
  admin: {
    label: 'Admin',
    className: 'bg-primary/20 text-primary border-primary/30',
  },
  analyst: {
    label: 'Analista',
    className: 'bg-success/20 text-success border-success/30',
  },
  viewer: {
    label: 'Visualizador',
    className: 'bg-muted/50 text-muted-foreground border-muted',
  },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
