import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { SPPProntuario, ModuleKPI, TableColumn, FilterValues } from '@/types/modules';
import { calculateSPPKPIs } from '@/lib/business-rules';
import { FileText, DollarSign, Clock, AlertCircle } from 'lucide-react';

const mockProntuarios: SPPProntuario[] = [
  {
    id: '1',
    data_arquivamento: '2024-01-10',
    data_solicitacao: '2024-01-08',
    setor_solicitante: 'UTI',
    justificativa: 'Alta médica',
    tempo_resposta: 2,
    tipo_solicitacao: 'setor',
  },
];

export default function SPPPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateSPPKPIs(mockProntuarios);

  const kpis: ModuleKPI[] = [
    {
      id: 'prontuarios_arquivados',
      title: 'Prontuários Arquivados',
      value: kpisCalculados.prontuariosArquivados,
      icon: FileText,
      variant: 'default',
    },
    {
      id: 'custo_operacional',
      title: 'Custo Operacional',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        kpisCalculados.custoOperacional
      ),
      icon: DollarSign,
      variant: 'default',
    },
    {
      id: 'solicitacoes',
      title: 'Solicitações',
      value: kpisCalculados.solicitacoes,
      icon: AlertCircle,
      variant: 'default',
    },
    {
      id: 'tempo_resposta',
      title: 'Tempo Médio Resposta',
      value: `${kpisCalculados.tempoMedioResposta.toFixed(1)}h`,
      icon: Clock,
      variant: 'default',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'data_arquivamento', label: 'Data Arquivamento', accessor: 'data_arquivamento', sortable: true },
    { id: 'setor_solicitante', label: 'Setor', accessor: 'setor_solicitante', sortable: true },
    { id: 'justificativa', label: 'Justificativa', accessor: 'justificativa', sortable: true },
    {
      id: 'tempo_resposta',
      label: 'Tempo Resposta',
      accessor: 'tempo_resposta',
      sortable: true,
      render: (value: number | undefined) => (value ? `${value}h` : '-'),
    },
  ];

  return (
    <ModuleLayout
      title="SPP"
      subtitle="Serviço de Prontuário"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <DataTable columns={columns} data={mockProntuarios} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
