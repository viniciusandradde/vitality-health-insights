import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { FarmaciaMedicamento, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateFarmaciaKPIs } from '@/lib/business-rules';
import { Pill, DollarSign, Package, TrendingUp } from 'lucide-react';

const mockMedicamentos: FarmaciaMedicamento[] = [
  {
    id: '1',
    data: '2024-01-10',
    medicamento: 'Paracetamol 500mg',
    quantidade: 100,
    centro_custo: 'UTI',
    tipo: 'medicamento',
    antimicrobiano: false,
    retorno: false,
  },
];

const mockRankingMedicamentos: ChartData[] = [
  { name: 'Paracetamol', value: 500 },
  { name: 'Dipirona', value: 350 },
  { name: 'Amoxicilina', value: 200 },
];

export default function FarmaciaPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateFarmaciaKPIs(mockMedicamentos);

  const kpis: ModuleKPI[] = [
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
      id: 'saida_estoque',
      title: 'Saída de Estoque',
      value: kpisCalculados.saidaEstoque,
      icon: Package,
      variant: 'default',
    },
    {
      id: 'controle_antimicrobianos',
      title: 'Controle Antimicrobianos',
      value: kpisCalculados.controleAntimicrobianos.total,
      icon: Pill,
      variant: 'warning',
    },
    {
      id: 'sazonalidades',
      title: 'Sazonalidade',
      value: `${kpisCalculados.sazonalidades > 0 ? '+' : ''}${kpisCalculados.sazonalidades.toFixed(1)}%`,
      icon: TrendingUp,
      variant: kpisCalculados.sazonalidades > 0 ? 'warning' : 'success',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'medicamento', label: 'Medicamento', accessor: 'medicamento', sortable: true },
    { id: 'quantidade', label: 'Quantidade', accessor: 'quantidade', sortable: true },
    { id: 'centro_custo', label: 'Centro de Custo', accessor: 'centro_custo', sortable: true },
    { id: 'tipo', label: 'Tipo', accessor: 'tipo', sortable: true },
  ];

  const charts = [
    {
      id: 'ranking_medicamentos',
      title: 'Ranking de Medicamentos',
      type: 'bar' as const,
      data: mockRankingMedicamentos,
      dataKey: 'value',
      xAxisKey: 'name',
    },
  ];

  return (
    <ModuleLayout
      title="Farmácia"
      subtitle="Gestão farmacêutica"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <ChartSection charts={charts} columns={2} />
      <DataTable columns={columns} data={mockMedicamentos} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
