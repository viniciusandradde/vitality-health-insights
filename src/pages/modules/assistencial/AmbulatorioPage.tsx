import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { AMBULATORIO_FILTERS } from '@/types/filters';
import type { AmbulatorioAgendamento, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateAmbulatorioKPIs, calculateAmbulatorioNovosKPIs } from '@/lib/business-rules';
import { Calendar, Activity, AlertCircle, Clock, DollarSign, FileText, Stethoscope } from 'lucide-react';

// Dados mock inline
const mockAgendamentos: AmbulatorioAgendamento[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-11',
    hora: '08:00',
    especialidade: 'Clínica Geral',
    profissional: 'Dr. João Santos',
    status: 'agendado',
    tipo: 'consulta',
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data: '2024-01-11',
    hora: '08:30',
    especialidade: 'Cardiologia',
    profissional: 'Dra. Ana Costa',
    status: 'confirmado',
    tipo: 'retorno',
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data: '2024-01-11',
    hora: '09:00',
    especialidade: 'Pediatria',
    profissional: 'Dr. Carlos Mendes',
    status: 'agendado',
    tipo: 'consulta',
  },
  {
    id: '4',
    paciente_id: 'P004',
    paciente_nome: 'Ana Paula',
    data: '2024-01-11',
    hora: '09:30',
    especialidade: 'Ginecologia',
    profissional: 'Dra. Lucia Ferreira',
    status: 'confirmado',
    tipo: 'exame',
  },
  {
    id: '5',
    paciente_id: 'P005',
    paciente_nome: 'Roberto Lima',
    data: '2024-01-11',
    hora: '10:00',
    especialidade: 'Ortopedia',
    profissional: 'Dr. Fernando Rocha',
    status: 'em_atendimento',
    tipo: 'procedimento',
  },
  {
    id: '6',
    paciente_id: 'P006',
    paciente_nome: 'Carla Souza',
    data: '2024-01-11',
    hora: '10:30',
    especialidade: 'Clínica Geral',
    profissional: 'Dr. João Santos',
    status: 'no_show',
    tipo: 'consulta',
  },
  {
    id: '7',
    paciente_id: 'P007',
    paciente_nome: 'Marcos Pereira',
    data: '2024-01-11',
    hora: '11:00',
    especialidade: 'Cardiologia',
    profissional: 'Dra. Ana Costa',
    status: 'finalizado',
    tipo: 'retorno',
  },
  {
    id: '8',
    paciente_id: 'P008',
    paciente_nome: 'Juliana Martins',
    data: '2024-01-11',
    hora: '11:30',
    especialidade: 'Pediatria',
    profissional: 'Dr. Carlos Mendes',
    status: 'cancelado',
    tipo: 'consulta',
    observacoes: 'Cancelado pelo paciente',
  },
];

const mockAgendamentosPorDia: ChartData[] = [
  { dia: 'Seg', agendados: 145, confirmados: 132, no_show: 13 },
  { dia: 'Ter', agendados: 158, confirmados: 145, no_show: 13 },
  { dia: 'Qua', agendados: 162, confirmados: 150, no_show: 12 },
  { dia: 'Qui', agendados: 155, confirmados: 142, no_show: 13 },
  { dia: 'Sex', agendados: 148, confirmados: 138, no_show: 10 },
  { dia: 'Sáb', agendados: 85, confirmados: 78, no_show: 7 },
  { dia: 'Dom', agendados: 45, confirmados: 42, no_show: 3 },
];

const mockAgendamentosPorEspecialidade: ChartData[] = [
  { name: 'Clínica Geral', value: 320 },
  { name: 'Cardiologia', value: 185 },
  { name: 'Pediatria', value: 165 },
  { name: 'Ginecologia', value: 142 },
  { name: 'Ortopedia', value: 98 },
];

const mockAgendamentosPorStatus: ChartData[] = [
  { name: 'Agendado', value: 45 },
  { name: 'Confirmado', value: 35 },
  { name: 'Em Atendimento', value: 12 },
  { name: 'Finalizado', value: 58 },
  { name: 'No-Show', value: 8 },
  { name: 'Cancelado', value: 5 },
];

export default function AmbulatorioPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'today',
  });

  // Calcular KPIs usando regras de negócio
  const kpisCalculados = calculateAmbulatorioKPIs(mockAgendamentos);
  const kpisNovos = calculateAmbulatorioNovosKPIs(mockAgendamentos);

  // KPIs formatados
  const kpis: ModuleKPI[] = [
    {
      id: 'agendamentos_hoje',
      title: 'Agendamentos Hoje',
      value: kpisCalculados.agendamentosHoje,
      icon: Calendar,
      trend: { value: 5.2, label: 'vs média' },
      variant: 'default',
    },
    {
      id: 'taxa_ocupacao_ambulatorio',
      title: 'Taxa de Ocupação',
      value: `${kpisCalculados.taxaOcupacao}%`,
      icon: Activity,
      trend: { value: 2.1, label: 'vs ontem' },
      variant: 'default',
    },
    {
      id: 'taxa_no_show',
      title: 'Taxa de No-Show',
      value: `${kpisCalculados.taxaNoShow}%`,
      icon: AlertCircle,
      trend: { value: -3.5, label: 'vs semana' },
      variant: 'success',
    },
    {
      id: 'encaixes_hoje',
      title: 'Encaixes Hoje',
      value: kpisCalculados.encaixesHoje,
      icon: Clock,
      variant: 'default',
    },
    // Novos KPIs solicitados
    {
      id: 'custo_operacional',
      title: 'Custo Operacional',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        kpisNovos.custoOperacional
      ),
      icon: DollarSign,
      variant: 'default',
    },
    {
      id: 'atendimentos_por_clinica',
      title: 'Atendimentos por Clínica',
      value: kpisNovos.atendimentosPorClinica.length,
      icon: Stethoscope,
      variant: 'default',
    },
    {
      id: 'atendimentos_sus',
      title: 'Atendimentos SUS',
      value: `${kpisNovos.atendimentosSUSAtendimento}/${kpisNovos.atendimentosSUSProcedimento}`,
      icon: Activity,
      variant: 'default',
    },
    {
      id: 'fichas_abertas_finalizadas',
      title: 'Fichas Abertas/Finalizadas',
      value: `${kpisNovos.fichasAbertas}/${kpisNovos.fichasFinalizadas}`,
      icon: FileText,
      variant: 'default',
    },
    {
      id: 'procedimentos_exames_gerados',
      title: 'Procedimentos/Exames Gerados',
      value: kpisNovos.procedimentosExamesGerados,
      icon: Stethoscope,
      variant: 'default',
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
      render: (_, row: AmbulatorioAgendamento) => (
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
      id: 'tipo',
      label: 'Tipo',
      accessor: 'tipo',
      sortable: true,
      render: (value: string) => {
        const tipoLabels: Record<string, string> = {
          consulta: 'Consulta',
          retorno: 'Retorno',
          exame: 'Exame',
          procedimento: 'Procedimento',
        };
        return tipoLabels[value] || value;
      },
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; variant: string }> = {
          agendado: { label: 'Agendado', variant: 'default' },
          confirmado: { label: 'Confirmado', variant: 'success' },
          em_atendimento: { label: 'Em Atendimento', variant: 'default' },
          finalizado: { label: 'Finalizado', variant: 'success' },
          no_show: { label: 'No-Show', variant: 'destructive' },
          cancelado: { label: 'Cancelado', variant: 'destructive' },
        };

        const config = statusConfig[value] || { label: value, variant: 'default' };
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

  // Gráficos
  const charts = [
    {
      id: 'agendamentos_por_dia',
      title: 'Agendamentos por Dia da Semana',
      description: 'Última semana',
      type: 'multi-line' as const,
      data: mockAgendamentosPorDia,
      xAxisKey: 'dia',
      lines: [
        { dataKey: 'agendados', color: 'hsl(200, 98%, 39%)', name: 'Agendados' },
        { dataKey: 'confirmados', color: 'hsl(142, 76%, 36%)', name: 'Confirmados' },
        { dataKey: 'no_show', color: 'hsl(0, 72%, 50%)', name: 'No-Show' },
      ],
    },
    {
      id: 'agendamentos_por_especialidade',
      title: 'Agendamentos por Especialidade',
      description: 'Volume de agendamentos',
      type: 'bar' as const,
      data: mockAgendamentosPorEspecialidade,
      dataKey: 'value',
      xAxisKey: 'name',
    },
    {
      id: 'agendamentos_por_status',
      title: 'Distribuição por Status',
      description: 'Status atual dos agendamentos',
      type: 'pie' as const,
      data: mockAgendamentosPorStatus,
    },
  ];

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
  };

  const handleExport = () => {
    console.log('Exportando dados de ambulatório...');
  };

  return (
    <ModuleLayout
      title="Ambulatório"
      subtitle="Gestão ambulatorial"
      filters={AMBULATORIO_FILTERS}
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
        data={mockAgendamentos}
        searchable={true}
        searchPlaceholder="Buscar por paciente, especialidade, profissional..."
        pagination={{ pageSize: 10, showPagination: true }}
      />
    </ModuleLayout>
  );
}
