import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, IntegrationCard } from '@/components/configuracoes';
import { mockIntegrations } from '@/data/mockSettings';
import { toast } from 'sonner';

export default function IntegracoesPage() {
  return (
    <AppLayout>
      <ConfigLayout title="Integrações" description="Conecte sistemas externos">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConfigure={() => toast.info(`Configurar ${integration.name}`)}
              onSync={() => toast.success(`Sincronizando ${integration.name}`)}
              onDisconnect={() => toast.warning(`Desconectar ${integration.name}`)}
            />
          ))}
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
