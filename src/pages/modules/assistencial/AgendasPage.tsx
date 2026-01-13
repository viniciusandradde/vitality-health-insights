import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { AMBULATORIO_FILTERS } from '@/types/filters';
import type { AmbulatorioAgendamento, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { calculateAmbulatorioKPIs, calculateTaxaEncaixes } from '@/lib/business-rules';
import { Calendar, Clock, TrendingUp, Users } from 'lucide-react';

// Reutiliza dados de ambulatório
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
];

const mockAgendasPorHorario: ChartData[] = [
  { horario: '08:00', ocupacao: 85 },
  { horario: '09:00', ocupacao: 92 },
  { horario: '10:00', ocupacao: 88 },
  { horario: '11:00', ocupacao: 75 },
  { horario: '14:00', ocupacao: 90 },
  { horario: '15:00', ocupacao: 88 },
  { horario: '16:00', ocupacao: 82 },
  { horario: '17:00', ocupacao: 70 },
];

const mockAgendasEncaixes: ChartData[] = [
  { dia: 'Seg', encaixes: 5 },
  { dia: 'Ter', encaixes: 7 },
  { dia: 'Qua', encaixes: 6 },
  { dia: 'Qui', encaixes: 8 },
  { dia: 'Sex', encaixes: 4 },
  { dia: 'Sáb', encaixes: 2 },
  { dia: 'Dom', encaixes: 1 },
];

const mockAgendasCancelamentos: ChartData[] = [
  { motivo: 'Paciente', value: 45 },
  { motivo: 'Profissional', value: 12 },
  { motivo: 'Clínica', value: 8 },
  { motivo: 'Outros', value: 5 },
];

export default function AgendasPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'today',
  });

  // Calcular KPIs
  const kpisCalculados = calculateAmbulatorioKPIs(mockAgendamentos);
  const taxaEncaixes = calculateTaxaEncaixes(mockAgendamentos);

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
      id: 'taxa_ocupacao',
      title: 'Taxa de Ocupação',
      value: `${kpisCalculados.taxaOcupacao}%`,
      icon: Activity,
      variant: 'default',
    },
    {
      id: 'taxa_encaixes',
      title: 'Taxa de Encaixes',
      value: `${taxaEncaixes}%`,
      icon: TrendingUp,
      variant: 'default',
    },
    {
      id: 'taxa_no_show',
      title: 'Taxa de No-Show',
      value: `${kpisCalculados.taxaNoShow}%`,
      icon: Clock,
      trend: { value: -3.5, label: 'vs semana' },
      variant: 'success',
    },
  ];

  // Colunas da tabela (similar ao ambulatório)
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
      id: 'ocupacao_por_horario',
      title: 'Ocupação por Horário',
      description: 'Distribuição de ocupação ao longo do dia',
      type: 'area' as const,
      data: mockAgendasPorHorario,
      dataKey: 'ocupacao',
      xAxisKey: 'horario',
    },
    {
      id: 'encaixes_semanal',
      title: 'Encaixes Semanal',
      description: 'Encaixes realizados por dia',
      type: 'bar' as const,
      data: mockAgendasEncaixes,
      dataKey: 'encaixes',
      xAxisKey: 'dia',
    },
    {
      id: 'cancelamentos_por_motivo',
      title: 'Cancelamentos por Motivo',
      description: 'Análise de cancelamentos',
      type: 'pie' as const,
      data: mockAgendasCancelamentos,
    },
  ];

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
  };

  const handleExport = () => {
    console.log('Exportando dados de agendas...');
  };

  return (
    <ModuleLayout
      title="Agendas"
      subtitle="Gestão de agendamentos"
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
