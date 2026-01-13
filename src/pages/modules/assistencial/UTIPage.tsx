import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { UTIInternacao, UTIVentilacao, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateUTIKPIs } from '@/lib/business-rules';
import { Activity, Clock, TrendingDown, Users, AlertCircle, Heart } from 'lucide-react';

// Dados mock inline
const mockInternacoes: UTIInternacao[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data_internacao: '2024-01-10',
    apache_score: 25,
    ventilacao_mecanica: true,
    desfecho: 'em_internacao',
    dias_permanencia: 5,
    readmissao: false,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data_internacao: '2024-01-08',
    data_alta: '2024-01-12',
    apache_score: 18,
    ventilacao_mecanica: false,
    desfecho: 'alta',
    dias_permanencia: 4,
    readmissao: false,
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data_internacao: '2024-01-05',
    data_alta: '2024-01-09',
    apache_score: 32,
    ventilacao_mecanica: true,
    desfecho: 'obito',
    dias_permanencia: 4,
    readmissao: false,
  },
];

const mockVentilacoes: UTIVentilacao[] = [
  {
    id: '1',
    paciente_id: 'P001',
    data_inicio: '2024-01-10',
    tipo: 'invasiva',
    dias_ventilacao: 5,
  },
  {
    id: '2',
    paciente_id: 'P003',
    data_inicio: '2024-01-05',
    data_fim: '2024-01-09',
    tipo: 'invasiva',
    dias_ventilacao: 4,
  },
];

const mockOcupacaoUTI: ChartData[] = [
  { name: 'Ocupados', value: 25 },
  { name: 'Disponíveis', value: 5 },
];

const mockDesfechosUTI: ChartData[] = [
  { name: 'Alta', value: 60 },
  { name: 'Óbito', value: 20 },
  { name: 'Transferência', value: 15 },
  { name: 'Em Internação', value: 5 },
];

export default function UTIPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'this_month',
  });

  const kpisCalculados = calculateUTIKPIs(mockInternacoes, mockVentilacoes);

  const kpis: ModuleKPI[] = [
    {
      id: 'taxa_ocupacao',
      title: 'Taxa de Ocupação',
      value: `${kpisCalculados.taxaOcupacao}%`,
      icon: Activity,
      variant: 'default',
    },
    {
      id: 'tempo_medio_permanencia',
      title: 'Tempo Médio Permanência',
      value: `${kpisCalculados.tempoMedioPermanencia} dias`,
      icon: Clock,
      variant: 'default',
    },
    {
      id: 'taxa_mortalidade',
      title: 'Taxa de Mortalidade',
      value: `${kpisCalculados.taxaMortalidade}%`,
      icon: TrendingDown,
      variant: 'destructive',
    },
    {
      id: 'apache_score_medio',
      title: 'Escore APACHE Médio',
      value: kpisCalculados.apacheScoreMedio,
      icon: Heart,
      variant: 'default',
    },
    {
      id: 'taxa_readmissao',
      title: 'Taxa de Readmissão',
      value: `${kpisCalculados.taxaReadmissao}%`,
      icon: AlertCircle,
      variant: 'default',
    },
    {
      id: 'ventilacao_mecanica',
      title: 'Ventilação Mecânica',
      value: kpisCalculados.ventilacaoMecanica,
      icon: Activity,
      variant: 'default',
    },
    {
      id: 'tempo_medio_ventilacao',
      title: 'Tempo Médio Ventilação',
      value: `${kpisCalculados.tempoMedioVentilacao} dias`,
      icon: Clock,
      variant: 'default',
    },
    {
      id: 'altas_uti',
      title: 'Altas da UTI',
      value: kpisCalculados.altasUTI,
      icon: Users,
      variant: 'success',
    },
    {
      id: 'obitos_uti',
      title: 'Óbitos na UTI',
      value: kpisCalculados.obitosUTI,
      icon: TrendingDown,
      variant: 'destructive',
    },
    {
      id: 'taxa_infeccao_uti',
      title: 'Taxa de Infecção na UTI',
      value: `${kpisCalculados.taxaInfeccaoUTI}%`,
      icon: AlertCircle,
      variant: 'destructive',
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
      id: 'data_internacao',
      label: 'Data Internação',
      accessor: 'data_internacao',
      sortable: true,
    },
    {
      id: 'apache_score',
      label: 'APACHE Score',
      accessor: 'apache_score',
      sortable: true,
    },
    {
      id: 'ventilacao_mecanica',
      label: 'Ventilação Mecânica',
      accessor: 'ventilacao_mecanica',
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value
              ? 'bg-destructive/10 text-destructive'
              : 'bg-emerald-500/10 text-emerald-600'
          }`}
        >
          {value ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      id: 'dias_permanencia',
      label: 'Dias Permanência',
      accessor: 'dias_permanencia',
      sortable: true,
    },
    {
      id: 'desfecho',
      label: 'Desfecho',
      accessor: 'desfecho',
      sortable: true,
      render: (value: string) => {
        const desfechoConfig: Record<string, { label: string; variant: string }> = {
          alta: { label: 'Alta', variant: 'success' },
          obito: { label: 'Óbito', variant: 'destructive' },
          transferencia: { label: 'Transferência', variant: 'default' },
          em_internacao: { label: 'Em Internação', variant: 'default' },
        };
        const config = desfechoConfig[value] || { label: value, variant: 'default' };
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
  ];

  const charts = [
    {
      id: 'ocupacao_uti',
      title: 'Ocupação de Leitos UTI',
      description: 'Leitos ocupados vs disponíveis',
      type: 'pie' as const,
      data: mockOcupacaoUTI,
    },
    {
      id: 'desfechos_uti',
      title: 'Desfechos da UTI',
      description: 'Distribuição de desfechos',
      type: 'bar' as const,
      data: mockDesfechosUTI,
      dataKey: 'value',
      xAxisKey: 'name',
    },
  ];

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
  };

  const handleExport = () => {
    console.log('Exportando dados de UTI...');
  };

  return (
    <ModuleLayout
      title="UTI"
      subtitle="Unidade de Terapia Intensiva"
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
        data={mockInternacoes}
        searchable={true}
        searchPlaceholder="Buscar por paciente..."
        pagination={{ pageSize: 10, showPagination: true }}
      />
    </ModuleLayout>
  );
}
