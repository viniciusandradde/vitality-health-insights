import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, AuditLogTable } from '@/components/configuracoes';
import { getAuditLogs } from '@/lib/api/settings';
import { toast } from 'sonner';
import type { AuditLog } from '@/types/settings';

export default function SegurancaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(100);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <ConfigLayout title="Segurança" description="Logs de auditoria e configurações de segurança">
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Carregando logs...</p>
          </div>
        </ConfigLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ConfigLayout title="Segurança" description="Logs de auditoria e configurações de segurança">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground mb-4">Logs de Auditoria</h3>
            <AuditLogTable logs={logs} />
          </div>
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
