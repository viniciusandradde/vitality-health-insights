import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IndicadoresGeraisDashboard from './dashboard/IndicadoresGeraisDashboard';
import InternacoesDashboard from './dashboard/InternacoesDashboard';
import OcupacaoLeitosDashboard from './dashboard/OcupacaoLeitosDashboard';
import AtendimentosDashboard from './dashboard/AtendimentosDashboard';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('geral');

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do hospital">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="internacoes">Internações</TabsTrigger>
          <TabsTrigger value="ocupacao">Ocupação de Leitos</TabsTrigger>
          <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-0">
          <IndicadoresGeraisDashboard />
        </TabsContent>

        <TabsContent value="internacoes" className="mt-0">
          <InternacoesDashboard />
        </TabsContent>

        <TabsContent value="ocupacao" className="mt-0">
          <OcupacaoLeitosDashboard />
        </TabsContent>

        <TabsContent value="atendimentos" className="mt-0">
          <AtendimentosDashboard />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
