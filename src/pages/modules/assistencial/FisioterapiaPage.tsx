import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { FisioterapiaSessao, FisioterapiaPaciente, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateFisioterapiaKPIs } from '@/lib/business-rules';
import { Activity, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

// Dados mock inline
const mockSessoes: FisioterapiaSessao[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-10',
    tipo_tratamento: 'Fisioterapia Respiratória',
    fisioterapeuta: 'Fisio. Ana Costa',
    evolucao: 'melhora',
    comparecimento: true,
    duracao_minutos: 60,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data: '2024-01-10',
    tipo_tratamento: 'Fisioterapia Motora',
    fisioterapeuta: 'Fisio. Carlos Mendes',
    evolucao: 'estavel',
    comparecimento: true,
    duracao_minutos: 45,
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data: '2024-01-09',
    tipo_tratamento: 'Fisioterapia Neurológica',
    fisioterapeuta: 'Fisio. Lucia Ferreira',
    evolucao: 'melhora',
    comparecimento: false,
    duracao_minutos: 0,
  },
];

const mockPacientes: FisioterapiaPaciente[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data_inicio: '2024-01-01',
    tipo_tratamento: 'Fisioterapia Respiratória',
    status: 'em_tratamento',
    total_sessoes: 10,
    dias_tratamento: 10,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data_inicio: '2023-12-15',
    data_alta: '2024-01-05',
    tipo_tratamento: 'Fisioterapia Motora',
    status: 'alta',
    total_sessoes: 20,
    dias_tratamento: 21,
  },
];

const mockSessoesPorTipo: ChartData[] = [
  { name: 'Respiratória', value: 45 },
  { name: 'Motora', value: 35 },
  { name: 'Neurológica', value: 20 },
];

const mockEvolucaoPacientes: ChartData[] = [
  { name: 'Melhora', value: 60 },
  { name: 'Estável', value: 30 },
  { name: 'Piora', value: 10 },
];

export default function FisioterapiaPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'this_month',
  });

  const kpisCalculados = calculateFisioterapiaKPIs(mockSessoes, mockPacientes);

  const kpis: ModuleKPI[] = [
    {
      id: 'sessoes_mensais',
      title: 'Sessões Mensais',
      value: kpisCalculados.sessoesMensais,
      icon: Activity,
      variant: 'default',
    },
    {
      id: 'taxa_ocupacao',
      title: 'Taxa de Ocupação',
      value: `${kpisCalculados.taxaOcupacaoFisioterapeutas}%`,
      icon: Users,
      variant: 'default',
    },
    {
      id: 'taxa_comparecimento',
      title: 'Taxa de Comparecimento',
      value: `${kpisCalculados.taxaComparecimento}%`,
      icon: CheckCircle,
      variant: 'success',
    },
    {
      id: 'tempo_medio_tratamento',
      title: 'Tempo Médio Tratamento',
      value: `${kpisCalculados.tempoMedioTratamento} dias`,
      icon: Clock,
      variant: 'default',
    },
    {
      id: 'pacientes_ativos',
      title: 'Pacientes em Tratamento',
      value: kpisCalculados.pacientesTratamentoAtivo,
      icon: Users,
      variant: 'default',
    },
    {
      id: 'altas',
      title: 'Altas de Fisioterapia',
      value: kpisCalculados.altasFisioterapia,
      icon: TrendingUp,
      variant: 'success',
    },
  ];

  const columns: TableColumn[] = [
    {
      id: 'paciente',
      label: 'Paciente',
      accessor: 'paciente_nome',
      sortable: true,
    },
    {
      id: 'data',
      label: 'Data',
      accessor: 'data',
      sortable: true,
    },
    {
      id: 'tipo_tratamento',
      label: 'Tipo de Tratamento',
      accessor: 'tipo_tratamento',
      sortable: true,
    },
    {
      id: 'fisioterapeuta',
      label: 'Fisioterapeuta',
      accessor: 'fisioterapeuta',
      sortable: true,
    },
    {
      id: 'evolucao',
      label: 'Evolução',
      accessor: 'evolucao',
      sortable: true,
      render: (value: string) => {
        const evolucaoConfig: Record<string, { label: string; variant: string }> = {
          melhora: { label: 'Melhora', variant: 'success' },
          estavel: { label: 'Estável', variant: 'default' },
          piora: { label: 'Piora', variant: 'destructive' },
        };
        const config = evolucaoConfig[value] || { label: value, variant: 'default' };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              config.variant === 'success'
                ? 'bg-emerald-500/10 text-emerald-600'
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
    {
      id: 'comparecimento',
      label: 'Comparecimento',
      accessor: 'comparecimento',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {value ? 'Sim' : 'Não'}
        </span>
      ),
    },
  ];

  const charts = [
    {
      id: 'sessoes_por_tipo',
      title: 'Sessões por Tipo',
      description: 'Distribuição por tipo de tratamento',
      type: 'pie' as const,
      data: mockSessoesPorTipo,
    },
    {
      id: 'evolucao_pacientes',
      title: 'Evolução de Pacientes',
      description: 'Distribuição de evolução',
      type: 'bar' as const,
      data: mockEvolucaoPacientes,
      dataKey: 'value',
      xAxisKey: 'name',
    },
  ];

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
  };

  const handleExport = () => {
    console.log('Exportando dados de Fisioterapia...');
  };

  return (
    <ModuleLayout
      title="Fisioterapia"
      subtitle="Análise de sessões e evolução"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={handleFilterChange}
      showExport={true}
      onExport={handleExport}
    >
      <KPIList kpis={kpis} columns={4} />
      <ChartSection charts={charts} columns={2} />
      <DataTable
        columns={columns}
        data={mockSessoes}
        searchable={true}
        searchPlaceholder="Buscar por paciente, tipo de tratamento..."
        pagination={{ pageSize: 10, showPagination: true }}
      />
    </ModuleLayout>
  );
}
