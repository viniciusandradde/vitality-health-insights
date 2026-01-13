import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { ImagemExame, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateImagemKPIs } from '@/lib/business-rules';
import { Scan, DollarSign, TrendingUp, Users } from 'lucide-react';

const mockExames: ImagemExame[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-10',
    tipo_exame: 'Raio-X Tórax',
    convenio: 'SUS',
    valor: 80.00,
    custo_estimado: 40.00,
    centro_custo: 'Imagem',
    externo: false,
    repeticao: false,
  },
];

const mockExamesPorConvenio: ChartData[] = [
  { name: 'SUS', value: 45 },
  { name: 'Convênio', value: 35 },
  { name: 'Particular', value: 20 },
];

export default function ImagemPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateImagemKPIs(mockExames);

  const kpis: ModuleKPI[] = [
    {
      id: 'quantidade_exames_mensais',
      title: 'Exames Mensais',
      value: kpisCalculados.quantidadeExamesMensais,
      icon: Scan,
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
      id: 'faturamento_por_exame',
      title: 'Faturamento por Exame',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        kpisCalculados.faturamentoPorExame
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
  ];

  const columns: TableColumn[] = [
    { id: 'paciente', label: 'Paciente', accessor: 'paciente_nome', sortable: true },
    { id: 'data', label: 'Data', accessor: 'data', sortable: true },
    { id: 'tipo_exame', label: 'Tipo de Exame', accessor: 'tipo_exame', sortable: true },
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
      id: 'exames_por_convenio',
      title: 'Exames por Convênio',
      type: 'pie' as const,
      data: mockExamesPorConvenio,
    },
  ];

  return (
    <ModuleLayout
      title="Exames de Imagem"
      subtitle="Gestão de exames de imagem"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <ChartSection charts={charts} columns={2} />
      <DataTable columns={columns} data={mockExames} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
