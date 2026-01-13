import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { TIChamado, TIImpressao, TIEquipamento, ModuleKPI, TableColumn, FilterValues } from '@/types/modules';
import { calculateTIKPIs } from '@/lib/business-rules';
import { Monitor, DollarSign, TrendingUp, Printer, AlertTriangle } from 'lucide-react';

const mockChamados: TIChamado[] = [
  {
    id: '1',
    data: '2024-01-10',
    centro_custo: 'UTI',
    tipo: 'Hardware',
    status: 'aberto',
  },
];

const mockImpressoes: TIImpressao[] = [
  {
    id: '1',
    data: '2024-01-10',
    centro_custo: 'UTI',
    quantidade: 150,
    tipo: 'A4',
  },
];

const mockEquipamentos: TIEquipamento[] = [
  {
    id: '1',
    centro_custo: 'UTI',
    tipo: 'Computador',
    localizacao: 'Sala 101',
    estado: 'operacional',
    alugado: false,
  },
];

export default function TIPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateTIKPIs(mockChamados, mockImpressoes, mockEquipamentos);

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
      id: 'sazonalidade',
      title: 'Sazonalidade',
      value: `${kpisCalculados.sazonalidade > 0 ? '+' : ''}${kpisCalculados.sazonalidade.toFixed(1)}%`,
      icon: TrendingUp,
      variant: kpisCalculados.sazonalidade > 0 ? 'warning' : 'success',
    },
    {
      id: 'chamados_centro_custo',
      title: 'Chamados por Centro de Custo',
      value: kpisCalculados.chamadosPorCentroCusto.length,
      icon: Monitor,
      variant: 'default',
    },
    {
      id: 'impressoes',
      title: 'Impressões',
      value: kpisCalculados.impressoesPorCentroCusto.reduce((sum, i) => sum + i.quantidade, 0),
      icon: Printer,
      variant: 'default',
    },
    {
      id: 'equipamentos_criticos',
      title: 'Equipamentos Críticos',
      value: kpisCalculados.equipamentosCriticos,
      icon: AlertTriangle,
      variant: 'destructive',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'data', label: 'Data', accessor: 'data', sortable: true },
    { id: 'centro_custo', label: 'Centro de Custo', accessor: 'centro_custo', sortable: true },
    { id: 'tipo', label: 'Tipo', accessor: 'tipo', sortable: true },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; variant: string }> = {
          aberto: { label: 'Aberto', variant: 'warning' },
          em_andamento: { label: 'Em Andamento', variant: 'default' },
          resolvido: { label: 'Resolvido', variant: 'success' },
          cancelado: { label: 'Cancelado', variant: 'destructive' },
        };
        const config = statusConfig[value] || { label: value, variant: 'default' };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              config.variant === 'success'
                ? 'bg-emerald-500/10 text-emerald-600'
                : config.variant === 'warning'
                ? 'bg-amber-500/10 text-amber-600'
                : config.variant === 'destructive'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {config.label}
          </span>
        );
      },
    },
  ];

  return (
    <ModuleLayout
      title="TI"
      subtitle="Tecnologia da Informação"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={5} />
      <DataTable columns={columns} data={mockChamados} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
