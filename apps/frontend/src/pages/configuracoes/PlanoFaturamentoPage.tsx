import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, PlanCard, InvoiceTable } from '@/components/configuracoes';
import { mockSubscription, mockInvoices } from '@/data/mockSettings';
import { toast } from 'sonner';

export default function PlanoFaturamentoPage() {
  return (
    <AppLayout>
      <ConfigLayout title="Plano e Faturamento" description="Gerencie sua assinatura e faturas">
        <div className="space-y-8">
          <PlanCard
            subscription={mockSubscription}
            onManage={() => toast.info('Abrindo portal de assinatura...')}
            onUpgrade={() => toast.info('Abrindo opções de upgrade...')}
          />

          <div>
            <h3 className="font-medium text-foreground mb-4">Histórico de Faturas</h3>
            <InvoiceTable invoices={mockInvoices} />
          </div>
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
