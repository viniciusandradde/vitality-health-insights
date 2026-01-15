import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, IntegrationCard } from '@/components/configuracoes';
import { getIntegrations } from '@/lib/api/settings';
import { toast } from 'sonner';
import type { Integration } from '@/types/settings';

export default function IntegracoesPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error('Erro ao carregar integrações');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <ConfigLayout title="Integrações" description="Conecte sistemas externos">
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Carregando integrações...</p>
          </div>
        </ConfigLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ConfigLayout title="Integrações" description="Conecte sistemas externos">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.map((integration) => (
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
