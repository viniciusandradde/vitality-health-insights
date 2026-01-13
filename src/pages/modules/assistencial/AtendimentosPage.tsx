import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection, FilterBar } from '@/components/modules';
import { ATENDIMENTOS_FILTERS } from '@/types/filters';
import type { Atendimento, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateAtendimentosKPIs, calculateRecepcaoPSKPIs } from '@/lib/business-rules';
import { Users, Clock, AlertTriangle, Activity, TrendingUp, FileText } from 'lucide-react';

// Dados mock inline (será movido para src/data/mock quando permissões forem resolvidas)
const mockAtendimentos: Atendimento[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-10',
    hora: '08:30',
    especialidade: 'Clínica Geral',
    profissional: 'Dr. João Santos',
    convenio: 'SUS',
    tipo: 'ambulatorial',
    status: 'finalizado',
    tempo_espera_minutos: 25,
    valor: 150.00,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data: '2024-01-10',
    hora: '09:15',
    especialidade: 'Cardiologia',
    profissional: 'Dra. Ana Costa',
    convenio: 'Unimed',
    tipo: 'ambulatorial',
    status: 'em_atendimento',
    tempo_espera_minutos: 15,
    valor: 300.00,
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data: '2024-01-10',
    hora: '10:00',
    especialidade: 'Pediatria',
    profissional: 'Dr. Carlos Mendes',
    convenio: 'Bradesco',
    tipo: 'ambulatorial',
    status: 'aguardando',
    tempo_espera_minutos: 45,
    valor: 200.00,
  },
  {
    id: '4',
    paciente_id: 'P004',
    paciente_nome: 'Ana Paula',
    data: '2024-01-10',
    hora: '11:20',
    especialidade: 'Ginecologia',
    profissional: 'Dra. Lucia Ferreira',
    convenio: 'Particular',
    tipo: 'ambulatorial',
    status: 'finalizado',
    tempo_espera_minutos: 10,
    valor: 250.00,
  },
  {
    id: '5',
    paciente_id: 'P005',
    paciente_nome: 'Roberto Lima',
    data: '2024-01-10',
    hora: '14:30',
    especialidade: 'Ortopedia',
    profissional: 'Dr. Fernando Rocha',
    convenio: 'SUS',
    tipo: 'emergencia',
    status: 'em_atendimento',
    tempo_espera_minutos: 30,
    valor: 400.00,
  },
  {
    id: '6',
    paciente_id: 'P006',
    paciente_nome: 'Carla Souza',
    data: '2024-01-10',
    hora: '15:45',
    especialidade: 'Clínica Geral',
    profissional: 'Dr. João Santos',
    convenio: 'Unimed',
    tipo: 'ambulatorial',
    status: 'aguardando',
    tempo_espera_minutos: 20,
    valor: 150.00,
  },
  {
    id: '7',
    paciente_id: 'P007',
    paciente_nome: 'Marcos Pereira',
    data: '2024-01-10',
    hora: '16:00',
    especialidade: 'Cardiologia',
    profissional: 'Dra. Ana Costa',
    convenio: 'Bradesco',
    tipo: 'ambulatorial',
    status: 'finalizado',
    tempo_espera_minutos: 35,
    valor: 300.00,
  },
  {
    id: '8',
    paciente_id: 'P008',
    paciente_nome: 'Juliana Martins',
    data: '2024-01-10',
    hora: '17:15',
    especialidade: 'Pediatria',
    profissional: 'Dr. Carlos Mendes',
    convenio: 'SUS',
    tipo: 'ambulatorial',
    status: 'cancelado',
    valor: 0,
  },
];

const mockAtendimentosPorHora: ChartData[] = [
  { hora: '06h', value: 12 },
  { hora: '08h', value: 45 },
  { hora: '10h', value: 78 },
  { hora: '12h', value: 65 },
  { hora: '14h', value: 82 },
  { hora: '16h', value: 71 },
  { hora: '18h', value: 55 },
  { hora: '20h', value: 38 },
  { hora: '22h', value: 22 },
];

const mockAtendimentosPorEspecialidade: ChartData[] = [
  { name: 'Clínica Geral', value: 245 },
  { name: 'Pediatria', value: 189 },
  { name: 'Ortopedia', value: 156 },
  { name: 'Cardiologia', value: 134 },
  { name: 'Ginecologia', value: 98 },
];

const mockAtendimentosPorConvenio: ChartData[] = [
  { name: 'SUS', value: 45 },
  { name: 'Unimed', value: 25 },
  { name: 'Bradesco', value: 15 },
  { name: 'Particular', value: 10 },
  { name: 'Outros', value: 5 },
];

export default function AtendimentosPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'today',
  });

  // Calcular KPIs usando regras de negócio
  const kpisCalculados = calculateAtendimentosKPIs(mockAtendimentos);
  const kpisPS = calculateRecepcaoPSKPIs(mockAtendimentos);

  // KPIs formatados
  const kpis: ModuleKPI[] = [
    {
      id: 'atendimentos_hoje',
      title: 'Atendimentos Hoje',
      value: kpisCalculados.atendimentosHoje,
      icon: Users,
      trend: { value: 12.5, label: 'vs ontem' },
      variant: 'default',
    },
    {
      id: 'tempo_medio_espera',
      title: 'Tempo Médio de Espera',
      value: `${kpisCalculados.tempoMedioEspera} min`,
      icon: Clock,
      trend: { value: -8.3, label: 'vs semana' },
      variant: 'success',
    },
    {
      id: 'atendimentos_aguardando',
      title: 'Em Espera',
      value: kpisCalculados.atendimentosAguardando,
      icon: AlertTriangle,
      variant: 'warning',
    },
    {
      id: 'taxa_ocupacao',
      title: 'Taxa de Ocupação',
      value: `${kpisCalculados.taxaOcupacao}%`,
      icon: Activity,
      trend: { value: 3.2, label: 'vs ontem' },
      variant: kpisCalculados.taxaOcupacao > 85 ? 'warning' : 'default',
    },
    // KPIs de Recepção PS
    {
      id: 'aumento_atendimentos',
      title: 'Aumento de Atendimentos',
      value: `${kpisPS.aumentoAtendimentos > 0 ? '+' : ''}${kpisPS.aumentoAtendimentos.toFixed(1)}%`,
      icon: TrendingUp,
      variant: kpisPS.aumentoAtendimentos > 0 ? 'warning' : 'success',
    },
    {
      id: 'fichas_abertas_finalizadas',
      title: 'Fichas Abertas/Finalizadas',
      value: `${kpisPS.fichasAbertas}/${kpisPS.fichasFinalizadas}`,
      icon: FileText,
      variant: 'default',
    },
    {
      id: 'sazonalidades',
      title: 'Sazonalidade',
      value: `${kpisPS.sazonalidade > 0 ? '+' : ''}${kpisPS.sazonalidade.toFixed(1)}%`,
      icon: TrendingUp,
      variant: kpisPS.sazonalidade > 0 ? 'warning' : 'success',
    },
  ];

  // Colunas da tabela
  const columns: TableColumn[] = [
    {
      id: 'paciente',
      label: 'Paciente',
      accessor: 'paciente_nome',
      sortable: true,
    },
    {
      id: 'data_hora',
      label: 'Data/Hora',
      accessor: 'data',
      sortable: true,
      render: (_, row: Atendimento) => (
        <div>
          <div className="font-medium">{row.data}</div>
          <div className="text-xs text-muted-foreground">{row.hora}</div>
        </div>
      ),
    },
    {
      id: 'especialidade',
      label: 'Especialidade',
      accessor: 'especialidade',
      sortable: true,
    },
    {
      id: 'profissional',
      label: 'Profissional',
      accessor: 'profissional',
      sortable: true,
    },
    {
      id: 'convenio',
      label: 'Convênio',
      accessor: 'convenio',
      sortable: true,
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; variant: string }> = {
          aguardando: { label: 'Aguardando', variant: 'warning' },
          em_atendimento: { label: 'Em Atendimento', variant: 'default' },
          finalizado: { label: 'Finalizado', variant: 'success' },
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
    {
      id: 'tempo_espera',
      label: 'Tempo Espera',
      accessor: 'tempo_espera_minutos',
      sortable: true,
      render: (value: number | undefined) =>
        value !== undefined ? `${value} min` : '-',
    },
    {
      id: 'valor',
      label: 'Valor',
      accessor: 'valor',
      sortable: true,
      render: (value: number | undefined) =>
        value !== undefined
          ? new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(value)
          : '-',
    },
  ];

  // Gráficos
  const charts = [
    {
      id: 'atendimentos_por_hora',
      title: 'Atendimentos por Hora',
      description: 'Últimas 24 horas',
      type: 'area' as const,
      data: mockAtendimentosPorHora,
      dataKey: 'value',
      xAxisKey: 'hora',
    },
    {
      id: 'atendimentos_por_especialidade',
      title: 'Top 5 Especialidades',
      description: 'Por volume de atendimentos',
      type: 'bar' as const,
      data: mockAtendimentosPorEspecialidade,
      dataKey: 'value',
      xAxisKey: 'name',
    },
    {
      id: 'atendimentos_por_convenio',
      title: 'Distribuição por Convênio',
      description: 'Atendimentos do mês',
      type: 'pie' as const,
      data: mockAtendimentosPorConvenio,
    },
  ];

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    // Em produção, isso recarregaria os dados
  };

  const handleExport = () => {
    // Em produção, isso exportaria os dados
    console.log('Exportando dados de atendimentos...');
  };

  return (
    <ModuleLayout
      title="Atendimentos"
      subtitle="Análise de atendimentos em tempo real"
      filters={ATENDIMENTOS_FILTERS}
      filterValues={filterValues}
      onFilterChange={handleFilterChange}
      showExport={true}
      onExport={handleExport}
    >
      {/* KPIs */}
      <KPIList kpis={kpis} columns={4} />

      {/* Gráficos */}
      <ChartSection charts={charts} columns={2} />

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={mockAtendimentos}
        searchable={true}
        searchPlaceholder="Buscar por paciente, especialidade, profissional..."
        pagination={{ pageSize: 10, showPagination: true }}
      />
    </ModuleLayout>
  );
}
