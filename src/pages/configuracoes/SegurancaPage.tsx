import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, AuditLogTable } from '@/components/configuracoes';
import { mockAuditLogs } from '@/data/mockSettings';

export default function SegurancaPage() {
  return (
    <AppLayout>
      <ConfigLayout title="Segurança" description="Logs de auditoria e configurações de segurança">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground mb-4">Logs de Auditoria</h3>
            <AuditLogTable logs={mockAuditLogs} />
          </div>
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
