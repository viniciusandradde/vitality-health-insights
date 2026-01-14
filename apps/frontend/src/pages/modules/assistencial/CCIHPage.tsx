import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { CCIHInfeccao, CCIHIsolamento, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateCCIHKPIs } from '@/lib/business-rules';
import { AlertTriangle, Users, Pill, Activity, TrendingDown, Clock } from 'lucide-react';

// Dados mock inline
const mockInfeccoes: CCIHInfeccao[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-10',
    tipo_infeccao: 'Pneumonia',
    topografia: 'Pulmão',
    isolamento: true,
    antimicrobiano: 'Ceftriaxona',
    desfecho: 'em_tratamento',
    sitio_cirurgico: false,
    iras: true,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data: '2024-01-09',
    tipo_infeccao: 'Infecção de Sítio Cirúrgico',
    topografia: 'Abdome',
    isolamento: true,
    antimicrobiano: 'Vancomicina',
    desfecho: 'alta',
    sitio_cirurgico: true,
    iras: true,
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data: '2024-01-08',
    tipo_infeccao: 'Sepse',
    topografia: 'Sistêmica',
    isolamento: false,
    antimicrobiano: 'Meropenem',
    desfecho: 'obito',
    sitio_cirurgico: false,
    iras: true,
  },
];

const mockIsolamentos: CCIHIsolamento[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data_inicio: '2024-01-10',
    tipo_isolamento: 'precaucao_aerossol',
    motivo: 'Pneumonia',
    dias_isolamento: 5,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data_inicio: '2024-01-09',
    data_fim: '2024-01-12',
    tipo_isolamento: 'precaucao_contato',
    motivo: 'Infecção de Sítio Cirúrgico',
    dias_isolamento: 3,
  },
];

const mockTopografiaInfeccoes: ChartData[] = [
  { name: 'Pulmão', value: 12 },
  { name: 'Abdome', value: 8 },
  { name: 'Sistêmica', value: 5 },
  { name: 'Urinária', value: 4 },
];

const mockInfeccoesPorTipo: ChartData[] = [
  { name: 'Pneumonia', value: 15 },
  { name: 'Sítio Cirúrgico', value: 10 },
  { name: 'Sepse', value: 8 },
  { name: 'Outras', value: 5 },
];

export default function CCIHPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'this_month',
  });

  const kpisCalculados = calculateCCIHKPIs(mockInfeccoes, mockIsolamentos);

  const kpis: ModuleKPI[] = [
    {
      id: 'taxa_infeccao_hospitalar',
      title: 'Taxa de Infecção Hospitalar',
      value: `${kpisCalculados.taxaInfeccaoHospitalar} por 1000`,
      icon: AlertTriangle,
      variant: 'destructive',
    },
    {
      id: 'taxa_sitio_cirurgico',
      title: 'Taxa Sítio Cirúrgico',
      value: `${kpisCalculados.taxaSitioCirurgico}%`,
      icon: Activity,
      variant: 'default',
    },
    {
      id: 'taxa_iras',
      title: 'Taxa de IRAS',
      value: `${kpisCalculados.taxaIRAS} por 1000`,
      icon: AlertTriangle,
      variant: 'destructive',
    },
    {
      id: 'pacientes_isolamento',
      title: 'Pacientes em Isolamento',
      value: kpisCalculados.pacientesIsolamento,
      icon: Users,
      variant: 'default',
    },
    {
      id: 'uso_antimicrobianos',
      title: 'Uso de Antimicrobianos',
      value: kpisCalculados.usoAntimicrobianos,
      icon: Pill,
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
      id: 'tempo_medio_isolamento',
      title: 'Tempo Médio Isolamento',
      value: `${kpisCalculados.tempoMedioIsolamento} dias`,
      icon: Clock,
      variant: 'default',
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
      id: 'tipo_infeccao',
      label: 'Tipo de Infecção',
      accessor: 'tipo_infeccao',
      sortable: true,
    },
    {
      id: 'topografia',
      label: 'Topografia',
      accessor: 'topografia',
      sortable: true,
    },
    {
      id: 'isolamento',
      label: 'Isolamento',
      accessor: 'isolamento',
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
      id: 'antimicrobiano',
      label: 'Antimicrobiano',
      accessor: 'antimicrobiano',
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
          em_tratamento: { label: 'Em Tratamento', variant: 'default' },
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
      id: 'topografia_infeccoes',
      title: 'Topografia de Infecções',
      description: 'Distribuição por localização',
      type: 'pie' as const,
      data: mockTopografiaInfeccoes,
    },
    {
      id: 'infeccoes_por_tipo',
      title: 'Infecções por Tipo',
      description: 'Distribuição por tipo de infecção',
      type: 'bar' as const,
      data: mockInfeccoesPorTipo,
      dataKey: 'value',
      xAxisKey: 'name',
    },
  ];

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
  };

  const handleExport = () => {
    console.log('Exportando dados de CCIH...');
  };

  return (
    <ModuleLayout
      title="CCIH"
      subtitle="Controle de Infecção Hospitalar"
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
        data={mockInfeccoes}
        searchable={true}
        searchPlaceholder="Buscar por paciente, tipo de infecção..."
        pagination={{ pageSize: 10, showPagination: true }}
      />
    </ModuleLayout>
  );
}
