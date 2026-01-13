import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { HotelariaRouparia, ModuleKPI, TableColumn, FilterValues } from '@/types/modules';
import { calculateHotelariaKPIs } from '@/lib/business-rules';
import { Bed, TrendingUp, Wrench, Package } from 'lucide-react';

const mockRouparia: HotelariaRouparia[] = [
  {
    id: '1',
    data: '2024-01-10',
    tipo: 'Lençol',
    quantidade: 200,
    perda_percentual: 2,
    chamados_manutencao: 5,
  },
];

export default function HotelariaPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateHotelariaKPIs(mockRouparia);

  const kpis: ModuleKPI[] = [
    {
      id: 'aumento_solicitacao',
      title: 'Aumento Solicitação Rouparia',
      value: `${kpisCalculados.aumentoSolicitacaoRouparia > 0 ? '+' : ''}${kpisCalculados.aumentoSolicitacaoRouparia.toFixed(1)}%`,
      icon: TrendingUp,
      variant: kpisCalculados.aumentoSolicitacaoRouparia > 0 ? 'warning' : 'success',
    },
    {
      id: 'chamados_manutencao',
      title: 'Chamados Manutenção',
      value: kpisCalculados.chamadosManutencao,
      icon: Wrench,
      variant: 'default',
    },
    {
      id: 'saida_estoque',
      title: 'Saída Estoque Tecidos',
      value: kpisCalculados.saidaEstoqueTecidos,
      icon: Package,
      variant: 'default',
    },
    {
      id: 'perdas_rouparia',
      title: 'Perdas de Rouparia',
      value: `${kpisCalculados.perdasRouparia.toFixed(1)}%`,
      icon: Bed,
      variant: kpisCalculados.perdasRouparia > 5 ? 'warning' : 'default',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'data', label: 'Data', accessor: 'data', sortable: true },
    { id: 'tipo', label: 'Tipo', accessor: 'tipo', sortable: true },
    { id: 'quantidade', label: 'Quantidade', accessor: 'quantidade', sortable: true },
    {
      id: 'perda_percentual',
      label: 'Perda %',
      accessor: 'perda_percentual',
      sortable: true,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
  ];

  return (
    <ModuleLayout
      title="Hotelaria"
      subtitle="Gestão de hotelaria e rouparia"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <DataTable columns={columns} data={mockRouparia} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
