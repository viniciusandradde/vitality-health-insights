import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { LaboratorioExame, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateLaboratorioKPIs } from '@/lib/business-rules';
import { FlaskConical, DollarSign, TrendingUp, Users, Package } from 'lucide-react';

// Dados mock inline
const mockExames: LaboratorioExame[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-10',
    tipo_exame: 'Hemograma Completo',
    convenio: 'SUS',
    valor: 50.00,
    custo_estimado: 25.00,
    centro_custo: 'Laboratório',
    externo: false,
    repeticao: false,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data: '2024-01-10',
    tipo_exame: 'Glicemia',
    convenio: 'convenio',
    valor: 30.00,
    custo_estimado: 15.00,
    centro_custo: 'Laboratório',
    externo: true,
    repeticao: false,
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data: '2024-01-10',
    tipo_exame: 'Colesterol Total',
    convenio: 'particular',
    valor: 40.00,
    custo_estimado: 20.00,
    centro_custo: 'Laboratório',
    externo: false,
    repeticao: true,
  },
];

const mockExamesPorConvenio: ChartData[] = [
  { name: 'SUS', value: 45 },
  { name: 'Convênio', value: 35 },
  { name: 'Particular', value: 20 },
];

const mockExamesPorTipo: ChartData[] = [
  { name: 'Hemograma', value: 120 },
  { name: 'Glicemia', value: 95 },
  { name: 'Colesterol', value: 80 },
  { name: 'Outros', value: 60 },
];

export default function LaboratorioPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'this_month',
  });

  const kpisCalculados = calculateLaboratorioKPIs(mockExames);

  const kpis: ModuleKPI[] = [
    {
      id: 'quantidade_exames_mensais',
      title: 'Exames Mensais',
      value: kpisCalculados.quantidadeExamesMensais,
      icon: FlaskConical,
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
      id: 'pacientes_externos',
      title: 'Pacientes Externos',
      value: kpisCalculados.pacientesExternosTotal,
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
    { id: 'tipo_exame', label: 'Tipo de Exame', accessor: 'tipo_exame', sortable: true },
    {
      id: 'convenio',
      label: 'Convênio',
      accessor: 'convenio',
      sortable: true,
      render: (value: string) => {
        const labels: Record<string, string> = {
          SUS: 'SUS',
          convenio: 'Convênio',
          particular: 'Particular',
        };
        return labels[value] || value;
      },
    },
    {
      id: 'valor',
      label: 'Valor',
      accessor: 'valor',
      sortable: true,
      render: (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
    },
    {
      id: 'externo',
      label: 'Externo',
      accessor: 'externo',
      sortable: true,
      render: (value: boolean) => (value ? 'Sim' : 'Não'),
    },
  ];

  const charts = [
    {
      id: 'exames_por_convenio',
      title: 'Exames por Convênio',
      type: 'pie' as const,
      data: mockExamesPorConvenio,
    },
    {
      id: 'exames_por_tipo',
      title: 'Exames por Tipo',
      type: 'bar' as const,
      data: mockExamesPorTipo,
      dataKey: 'value',
      xAxisKey: 'name',
    },
  ];

  return (
    <ModuleLayout
      title="Exames Laboratoriais"
      subtitle="Análise de exames laboratoriais"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={5} />
      <ChartSection charts={charts} columns={2} />
      <DataTable columns={columns} data={mockExames} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
