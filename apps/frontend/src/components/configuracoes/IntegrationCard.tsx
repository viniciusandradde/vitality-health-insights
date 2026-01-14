import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import {
  Database,
  MessageCircle,
  Mail,
  Webhook,
  Code,
  Settings,
  RefreshCw,
  Unplug,
  LucideIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Integration } from '@/types/settings';

interface IntegrationCardProps {
  integration: Integration;
  onConfigure?: (integration: Integration) => void;
  onSync?: (integration: Integration) => void;
  onDisconnect?: (integration: Integration) => void;
  disabled?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Database,
  MessageCircle,
  Mail,
  Webhook,
  Code,
};

export function IntegrationCard({
  integration,
  onConfigure,
  onSync,
  onDisconnect,
  disabled,
}: IntegrationCardProps) {
  const Icon = iconMap[integration.icon] || Database;

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return null;
    return format(new Date(dateString), "dd/MM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        integration.status === 'connected' && 'border-success/30',
        integration.status === 'error' && 'border-destructive/30'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2.5 rounded-lg',
                integration.status === 'connected'
                  ? 'bg-success/20 text-success'
                  : integration.status === 'error'
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{integration.name}</h4>
                <StatusBadge status={integration.status} />
              </div>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
              {integration.last_sync_at && (
                <p className="text-xs text-muted-foreground">
                  Última sincronização: {formatLastSync(integration.last_sync_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure?.(integration)}
            disabled={disabled}
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Configurar
          </Button>

          {integration.status === 'connected' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSync?.(integration)}
                disabled={disabled}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Sincronizar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDisconnect?.(integration)}
                disabled={disabled}
                className="text-destructive hover:text-destructive"
              >
                <Unplug className="h-3.5 w-3.5 mr-1.5" />
                Desconectar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
