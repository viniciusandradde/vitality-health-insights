import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { LavanderiaInsumo, ModuleKPI, TableColumn, FilterValues } from '@/types/modules';
import { calculateLavanderiaKPIs } from '@/lib/business-rules';
import { Shirt, DollarSign, TrendingUp } from 'lucide-react';

const mockInsumos: LavanderiaInsumo[] = [
  {
    id: '1',
    data: '2024-01-10',
    insumo: 'Sabão em Pó',
    quantidade: 50,
    custo: 500.00,
    centro_custo: 'Lavanderia',
  },
];

export default function LavanderiaPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateLavanderiaKPIs(mockInsumos);

  const kpis: ModuleKPI[] = [
    {
      id: 'saida_insumos',
      title: 'Saída de Insumos',
      value: kpisCalculados.saidaInsumos,
      icon: Shirt,
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
      title="Lavanderia"
      subtitle="Gestão de lavanderia e roupas"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={3} />
      <DataTable columns={columns} data={mockInsumos} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
