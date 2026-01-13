import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import { Check, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/types/settings';

interface PlanCardProps {
  subscription: Subscription;
  onManage?: () => void;
  onUpgrade?: () => void;
}

export function PlanCard({ subscription, onManage, onUpgrade }: PlanCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM", { locale: ptBR });
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{subscription.plan_name}</CardTitle>
              <StatusBadge status={subscription.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Próxima cobrança: {formatDate(subscription.current_period_end)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(subscription.price_monthly)}
            </p>
            <p className="text-sm text-muted-foreground">/mês</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Recursos incluídos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {subscription.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-success shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Uso do plano</h4>

          <div className="space-y-3">
            {/* Users */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usuários</span>
                <span className="font-medium text-foreground">
                  {subscription.usage.users.current} / {subscription.usage.users.limit}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(
                  subscription.usage.users.current,
                  subscription.usage.users.limit
                )}
                className={cn(
                  'h-2',
                  getUsageColor(
                    getUsagePercentage(
                      subscription.usage.users.current,
                      subscription.usage.users.limit
                    )
                  )
                )}
              />
            </div>

            {/* API Calls */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Chamadas API (hoje)</span>
                <span className="font-medium text-foreground">
                  {subscription.usage.api_calls.current.toLocaleString()} /{' '}
                  {subscription.usage.api_calls.limit.toLocaleString()}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(
                  subscription.usage.api_calls.current,
                  subscription.usage.api_calls.limit
                )}
                className="h-2"
              />
            </div>

            {/* Storage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Armazenamento</span>
                <span className="font-medium text-foreground">
                  {subscription.usage.storage_gb.current}GB / {subscription.usage.storage_gb.limit}GB
                </span>
              </div>
              <Progress
                value={getUsagePercentage(
                  subscription.usage.storage_gb.current,
                  subscription.usage.storage_gb.limit
                )}
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={onManage} variant="outline" className="flex-1">
            Gerenciar Assinatura
          </Button>
          <Button onClick={onUpgrade} className="flex-1">
            Fazer Upgrade
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
