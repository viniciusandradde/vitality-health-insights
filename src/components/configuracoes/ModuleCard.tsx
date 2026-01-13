import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Hospital,
  Calendar,
  BedDouble,
  HeartPulse,
  Pill,
  FlaskConical,
  Scan,
  ShieldCheck,
  UtensilsCrossed,
  Dumbbell,
  FileText,
  Wallet,
  Package,
  ClipboardList,
  LucideIcon,
} from 'lucide-react';
import type { SystemModule } from '@/types/settings';

interface ModuleCardProps {
  module: SystemModule;
  currentPlan: string;
  onToggle: (moduleId: string, enabled: boolean) => void;
  disabled?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Hospital,
  Calendar,
  BedDouble,
  HeartPulse,
  Pill,
  FlaskConical,
  Scan,
  ShieldCheck,
  UtensilsCrossed,
  Dumbbell,
  FileText,
  Wallet,
  Package,
  ClipboardList,
};

const categoryLabels: Record<string, string> = {
  core: 'Core',
  assistencial: 'Assistencial',
  gerencial: 'Gerencial',
};

const categoryColors: Record<string, string> = {
  core: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  assistencial: 'bg-primary/20 text-primary border-primary/30',
  gerencial: 'bg-success/20 text-success border-success/30',
};

export function ModuleCard({ module, currentPlan, onToggle, disabled }: ModuleCardProps) {
  const Icon = iconMap[module.icon] || LayoutDashboard;
  const isIncludedInPlan = module.included_in_plans.includes(currentPlan);
  const isCore = module.category === 'core';

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        module.enabled
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card',
        !isIncludedInPlan && 'opacity-60'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                module.enabled
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{module.name}</h4>
                <Badge
                  variant="outline"
                  className={cn('text-xs', categoryColors[module.category])}
                >
                  {categoryLabels[module.category]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{module.description}</p>
              {!isIncludedInPlan && (
                <p className="text-xs text-warning">
                  Requer upgrade de plano
                </p>
              )}
            </div>
          </div>

          <Switch
            checked={module.enabled}
            onCheckedChange={(checked) => onToggle(module.id, checked)}
            disabled={disabled || isCore || !isIncludedInPlan}
            aria-label={`Ativar ${module.name}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
