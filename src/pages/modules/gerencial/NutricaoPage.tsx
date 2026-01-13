import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { NutricaoRefeicao, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateNutricaoKPIs } from '@/lib/business-rules';
import { UtensilsCrossed, DollarSign, Package, AlertTriangle } from 'lucide-react';

const mockRefeicoes: NutricaoRefeicao[] = [
  {
    id: '1',
    data: '2024-01-10',
    tipo: 'paciente',
    quantidade: 150,
    custo: 7500.00,
    perda_marmitas: 5,
    receita_convenio: 6000.00,
    receita_particular: 1500.00,
  },
];

export default function NutricaoPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateNutricaoKPIs(mockRefeicoes);

  const kpis: ModuleKPI[] = [
    {
      id: 'saida_estoque',
      title: 'Saída de Estoque',
      value: kpisCalculados.saidaEstoque,
      icon: Package,
      variant: 'default',
    },
    {
      id: 'custo_por_refeicao',
      title: 'Custo por Refeição',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        kpisCalculados.custoPorRefeicaoPaciente
      ),
      icon: DollarSign,
      variant: 'default',
    },
    {
      id: 'receita',
      title: 'Receita Convênios/Particular',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        kpisCalculados.receitaConvenios + kpisCalculados.receitaParticular
      ),
      icon: DollarSign,
      variant: 'success',
    },
    {
      id: 'perda_marmitas',
      title: 'Perda de Marmitas',
      value: kpisCalculados.perdaMarmitas,
      icon: AlertTriangle,
      variant: 'warning',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'data', label: 'Data', accessor: 'data', sortable: true },
    { id: 'tipo', label: 'Tipo', accessor: 'tipo', sortable: true },
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
      title="Nutrição"
      subtitle="Gestão nutricional e dietas"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <DataTable columns={columns} data={mockRefeicoes} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
