import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, PlanCard, InvoiceTable } from '@/components/configuracoes';
import { getSubscription, getInvoices } from '@/lib/api/settings';
import { toast } from 'sonner';
import type { Subscription, Invoice } from '@/types/settings';

export default function PlanoFaturamentoPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subData, invData] = await Promise.all([
        getSubscription(),
        getInvoices(),
      ]);
      setSubscription(subData);
      setInvoices(invData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Erro ao carregar dados de assinatura');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <ConfigLayout title="Plano e Faturamento" description="Gerencie sua assinatura e faturas">
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        </ConfigLayout>
      </AppLayout>
    );
  }

  if (!subscription) {
    return (
      <AppLayout>
        <ConfigLayout title="Plano e Faturamento" description="Gerencie sua assinatura e faturas">
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Nenhuma assinatura encontrada</p>
          </div>
        </ConfigLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ConfigLayout title="Plano e Faturamento" description="Gerencie sua assinatura e faturas">
        <div className="space-y-8">
          <PlanCard
            subscription={subscription}
            onManage={() => toast.info('Abrindo portal de assinatura...')}
            onUpgrade={() => toast.info('Abrindo opções de upgrade...')}
          />

          <div>
            <h3 className="font-medium text-foreground mb-4">Histórico de Faturas</h3>
            <InvoiceTable invoices={invoices} />
          </div>
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
