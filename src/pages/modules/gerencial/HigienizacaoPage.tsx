import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { HigienizacaoInsumo, ModuleKPI, TableColumn, FilterValues } from '@/types/modules';
import { calculateHigienizacaoKPIs } from '@/lib/business-rules';
import { Sparkles, DollarSign, TrendingUp } from 'lucide-react';

const mockInsumos: HigienizacaoInsumo[] = [
  {
    id: '1',
    data: '2024-01-10',
    insumo: 'Desinfetante',
    quantidade: 30,
    custo: 300.00,
    centro_custo: 'Higienização',
  },
];

export default function HigienizacaoPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateHigienizacaoKPIs(mockInsumos);

  const kpis: ModuleKPI[] = [
    {
      id: 'saida_insumos',
      title: 'Saída de Insumos',
      value: kpisCalculados.saidaInsumos,
      icon: Sparkles,
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
      id: 'sinalizacao_aumento',
      title: 'Sinalização de Aumento',
      value: `${kpisCalculados.sinalizacaoAumento > 0 ? '+' : ''}${kpisCalculados.sinalizacaoAumento.toFixed(1)}%`,
      icon: TrendingUp,
      variant: kpisCalculados.sinalizacaoAumento > 0 ? 'warning' : 'success',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'data', label: 'Data', accessor: 'data', sortable: true },
    { id: 'insumo', label: 'Insumo', accessor: 'insumo', sortable: true },
    { id: 'quantidade', label: 'Quantidade', accessor: 'quantidade', sortable: true },
    {
      id: 'custo',
      label: 'Custo',
      accessor: 'custo',
      sortable: true,
      render: (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
    },
  ];

  return (
    <ModuleLayout
      title="Higienização"
      subtitle="Gestão de limpeza e higienização"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={3} />
      <DataTable columns={columns} data={mockInsumos} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
