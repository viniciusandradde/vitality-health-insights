import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { AuditLog } from '@/types/settings';

interface AuditLogTableProps {
  logs: AuditLog[];
}

const actionLabels: Record<string, { label: string; className: string }> = {
  login: { label: 'Login', className: 'bg-info/20 text-info border-info/30' },
  logout: { label: 'Logout', className: 'bg-muted/50 text-muted-foreground border-muted' },
  create: { label: 'Criou', className: 'bg-success/20 text-success border-success/30' },
  update: { label: 'Atualizou', className: 'bg-warning/20 text-warning border-warning/30' },
  delete: { label: 'Deletou', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  enable: { label: 'Ativou', className: 'bg-success/20 text-success border-success/30' },
  disable: { label: 'Desativou', className: 'bg-muted/50 text-muted-foreground border-muted' },
};

const resourceLabels: Record<string, string> = {
  auth: 'Autenticação',
  user: 'Usuário',
  organization: 'Organização',
  module: 'Módulo',
  integration: 'Integração',
  settings: 'Configurações',
};

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getActionBadge = (action: string) => {
    const config = actionLabels[action] || {
      label: action,
      className: 'bg-muted/50 text-muted-foreground border-muted',
    };

    return (
      <Badge variant="outline" className={cn('font-medium', config.className)}>
        {config.label}
      </Badge>
    );
  };

  const formatDetails = (log: AuditLog) => {
    if (!log.details || Object.keys(log.details).length === 0) {
      return resourceLabels[log.resource] || log.resource;
    }

    if (log.details.field) {
      return `${resourceLabels[log.resource] || log.resource}: ${log.details.field}`;
    }

    if (log.details.email) {
      return `${resourceLabels[log.resource] || log.resource}: ${log.details.email}`;
    }

    return resourceLabels[log.resource] || log.resource;
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum registro de auditoria encontrado
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead className="hidden md:table-cell">Recurso</TableHead>
            <TableHead className="hidden lg:table-cell">IP</TableHead>
            <TableHead>Data/Hora</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(log.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm">{log.user_name}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {log.user_email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getActionBadge(log.action)}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {formatDetails(log)}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground text-sm font-mono">
                {log.ip_address || '-'}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(log.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
