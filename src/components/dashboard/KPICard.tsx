import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  description?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  description,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              
              {trend && (
                <div className="flex items-center gap-1.5">
                  {TrendIcon && (
                    <TrendIcon
                      className={cn(
                        'h-4 w-4',
                        trend.value > 0 ? 'text-emerald-600' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground'
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      trend.value > 0 ? 'text-emerald-600' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {trend.value > 0 ? '+' : ''}
                    {trend.value}%
                  </span>
                  {trend.label && (
                    <span className="text-sm text-muted-foreground">{trend.label}</span>
                  )}
                </div>
              )}
              
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            
            <div className={cn('rounded-lg p-3', variantStyles[variant])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
