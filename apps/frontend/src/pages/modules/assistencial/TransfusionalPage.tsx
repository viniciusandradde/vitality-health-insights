import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { TransfusionalProcedimento, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateTransfusionalKPIs } from '@/lib/business-rules';
import { Droplet, DollarSign, TrendingUp, Users } from 'lucide-react';

const mockProcedimentos: TransfusionalProcedimento[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-10',
    tipo_procedimento: 'Transfusão de Sangue',
    convenio: 'SUS',
    valor: 200.00,
    custo_estimado: 100.00,
    centro_custo: 'Transfusional',
    repeticao: false,
  },
];

const mockProcedimentosPorConvenio: ChartData[] = [
  { name: 'SUS', value: 60 },
  { name: 'Convênio', value: 30 },
  { name: 'Particular', value: 10 },
];

export default function TransfusionalPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateTransfusionalKPIs(mockProcedimentos);

  const kpis: ModuleKPI[] = [
    {
      id: 'quantidade_procedimentos_mensais',
      title: 'Procedimentos Mensais',
      value: kpisCalculados.quantidadeProcedimentosMensais,
      icon: Droplet,
      variant: 'default',
    },
    {
      id: 'faturamento_mensal',
      title: 'Faturamento Mensal',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        kpisCalculados.faturamentoMensal
      ),
      icon: DollarSign,
      variant: 'success',
    },
    {
      id: 'pacientes_total',
      title: 'Pacientes Total',
      value: kpisCalculados.pacientesTotal,
      icon: Users,
      variant: 'default',
    },
    {
      id: 'sazonalidade',
      title: 'Sazonalidade',
      value: `${kpisCalculados.sazonalidade > 0 ? '+' : ''}${kpisCalculados.sazonalidade.toFixed(1)}%`,
      icon: TrendingUp,
      variant: kpisCalculados.sazonalidade > 0 ? 'warning' : 'success',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'paciente', label: 'Paciente', accessor: 'paciente_nome', sortable: true },
    { id: 'data', label: 'Data', accessor: 'data', sortable: true },
    { id: 'tipo_procedimento', label: 'Tipo', accessor: 'tipo_procedimento', sortable: true },
    {
      id: 'valor',
      label: 'Valor',
      accessor: 'valor',
      sortable: true,
      render: (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
    },
  ];

  const charts = [
    {
      id: 'procedimentos_por_convenio',
      title: 'Procedimentos por Convênio',
      type: 'pie' as const,
      data: mockProcedimentosPorConvenio,
    },
  ];

  return (
    <ModuleLayout
      title="Agência Transfusional"
      subtitle="Controle de sangue e hemocomponentes"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <ChartSection charts={charts} columns={2} />
      <DataTable columns={columns} data={mockProcedimentos} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
