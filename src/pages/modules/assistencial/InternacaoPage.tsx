import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { ChartCard, DonutChart, SimplePieChart } from '@/components/dashboard';
import { COMMON_FILTERS } from '@/types/filters';
import type { Internacao, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import type { Leito } from '@/types/dashboard';
import {
  calculateLeitosOperacionais,
  calculateTipoLeito,
  calculateLeitosPorSetor,
  calculateOcupacaoPorConvenioTop10,
  calculateOcupacaoPorEspecialidadeTop10,
} from '@/lib/business-rules';
import { BedDouble, Activity, TrendingDown, Users, Building2, CreditCard, Stethoscope } from 'lucide-react';

// Dados mock inline
const mockInternacoes: Internacao[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data_internacao: '2024-01-05',
    leito: '101-A',
    setor: 'Enfermaria A',
    tipo: 'enfermaria',
    diagnostico: 'Pneumonia',
    status: 'internado',
    dias_internacao: 5,
    convenio: 'Unimed',
    especialidade: 'Clínica Médica',
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data_internacao: '2024-01-08',
    leito: '201-B',
    setor: 'Enfermaria B',
    tipo: 'enfermaria',
    diagnostico: 'Hipertensão',
    status: 'internado',
    dias_internacao: 2,
    convenio: 'SUS',
    especialidade: 'Cardiologia',
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data_internacao: '2024-01-03',
    data_alta: '2024-01-10',
    leito: '301-A',
    setor: 'UTI',
    tipo: 'uti',
    diagnostico: 'Pós-operatório',
    status: 'alta_medica',
    dias_internacao: 7,
    convenio: 'Bradesco',
    especialidade: 'Cirurgia Geral',
  },
  {
    id: '4',
    paciente_id: 'P004',
    paciente_nome: 'Ana Costa',
    data_internacao: '2024-01-10',
    leito: '102-A',
    setor: 'Enfermaria A',
    tipo: 'enfermaria',
    diagnostico: 'Diabetes',
    status: 'internado',
    dias_internacao: 3,
    convenio: 'Unimed',
    especialidade: 'Endocrinologia',
  },
  {
    id: '5',
    paciente_id: 'P005',
    paciente_nome: 'Carlos Santos',
    data_internacao: '2024-01-12',
    leito: '202-B',
    setor: 'Enfermaria B',
    tipo: 'enfermaria',
    diagnostico: 'Fraturas',
    status: 'internado',
    dias_internacao: 1,
    convenio: 'SUS',
    especialidade: 'Ortopedia',
  },
];

// Mock de leitos para cálculos
const mockLeitos: Leito[] = [
  { id: '1', numero: '101-A', centro_custo: 'Enfermaria A', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P001' },
  { id: '2', numero: '102-A', centro_custo: 'Enfermaria A', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P004' },
  { id: '3', numero: '103-A', centro_custo: 'Enfermaria A', tipo: 'enfermaria', status: 'disponivel' },
  { id: '4', numero: '201-B', centro_custo: 'Enfermaria B', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P002' },
  { id: '5', numero: '202-B', centro_custo: 'Enfermaria B', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P005' },
  { id: '6', numero: '301-A', centro_custo: 'UTI', tipo: 'uti', status: 'disponivel' },
  { id: '7', numero: '302-A', centro_custo: 'UTI', tipo: 'uti', status: 'ocupado' },
  { id: '8', numero: '401-A', centro_custo: 'Apartamento', tipo: 'outro', status: 'ocupado' },
];

const mockOcupacaoPorSetor: ChartData[] = [
  { setor: 'UTI', ocupados: 28, total: 30, percentual: 93 },
  { setor: 'Enfermaria A', ocupados: 45, total: 50, percentual: 90 },
  { setor: 'Enfermaria B', ocupados: 38, total: 50, percentual: 76 },
  { setor: 'Enfermaria C', ocupados: 31, total: 50, percentual: 62 },
];

const mockInternacoesPorDia: ChartData[] = [
  { dia: 'Seg', internacoes: 8, altas: 10 },
  { dia: 'Ter', internacoes: 12, altas: 8 },
  { dia: 'Qua', internacoes: 10, altas: 9 },
  { dia: 'Qui', internacoes: 9, altas: 11 },
  { dia: 'Sex', internacoes: 11, altas: 7 },
  { dia: 'Sáb', internacoes: 6, altas: 5 },
  { dia: 'Dom', internacoes: 5, altas: 4 },
];

export default function InternacaoPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'today',
  });
  const [setorSelecionado, setSetorSelecionado] = useState<string | null>(null);

  // Calcular métricas operacionais
  const leitosOperacionais = calculateLeitosOperacionais(mockLeitos, mockInternacoes);
  const tipoLeito = calculateTipoLeito(mockLeitos);
  const leitosPorSetor = calculateLeitosPorSetor(mockLeitos, mockInternacoes);
  const ocupacaoPorConvenio = calculateOcupacaoPorConvenioTop10(mockInternacoes);
  const ocupacaoPorEspecialidade = calculateOcupacaoPorEspecialidadeTop10(mockInternacoes);

  const leitosOcupados = mockInternacoes.filter((i) => i.status === 'internado').length;
  const totalLeitos = mockLeitos.length;
  const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
  const tempoMedio = 4.2;

  // Dados para Donut Chart
  const donutData = [
    { name: 'Ocupado', value: leitosOperacionais.ocupado, color: 'hsl(0, 72%, 50%)' },
    { name: 'Livre', value: leitosOperacionais.livre, color: 'hsl(142, 76%, 36%)' },
  ];
  const percentualOcupado = totalLeitos > 0
    ? Number(((leitosOperacionais.ocupado / totalLeitos) * 100).toFixed(2))
    : 0;

  // Dados para Pie Chart - Tipo de Leito
  const tipoLeitoPieData = tipoLeito.map((t) => ({
    name: t.tipo,
    value: t.percentual,
  }));

  // Dados para Pie Chart - Ocupação por Convênio
  const convenioPieData = ocupacaoPorConvenio.map((c) => ({
    name: c.convenio,
    value: c.percentual,
  }));

  // Dados para Pie Chart - Ocupação por Especialidade
  const especialidadePieData = ocupacaoPorEspecialidade.map((e) => ({
    name: e.especialidade,
    value: e.percentual,
  }));

  const kpis: ModuleKPI[] = [
    {
      id: 'convenio',
      title: 'Convênio',
      value: leitosOperacionais.convenio,
      icon: CreditCard,
      variant: 'default',
    },
    {
      id: 'sus',
      title: 'SUS',
      value: leitosOperacionais.sus,
      icon: Building2,
      variant: 'default',
    },
    {
      id: 'ocupado',
      title: 'Ocupado',
      value: leitosOperacionais.ocupado,
      icon: BedDouble,
      variant: 'default',
    },
    {
      id: 'livre',
      title: 'Livre',
      value: leitosOperacionais.livre,
      icon: Users,
      variant: 'success',
    },
    {
      id: 'taxa_ocupacao',
      title: 'Taxa de Ocupação',
      value: `${taxaOcupacao}%`,
      icon: Activity,
      trend: { value: 2.5, label: 'vs ontem' },
      variant: taxaOcupacao > 85 ? 'warning' : taxaOcupacao < 75 ? 'warning' : 'default',
    },
    {
      id: 'tempo_medio',
      title: 'Tempo Médio de Permanência',
      value: `${tempoMedio} dias`,
      icon: TrendingDown,
      trend: { value: -0.3, label: 'vs semana' },
      variant: 'success',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'paciente', label: 'Paciente', accessor: 'paciente_nome', sortable: true },
    { id: 'data_internacao', label: 'Data Internação', accessor: 'data_internacao', sortable: true },
    { id: 'leito', label: 'Leito', accessor: 'leito', sortable: true },
    { id: 'setor', label: 'Setor', accessor: 'setor', sortable: true },
    { id: 'tipo', label: 'Tipo', accessor: 'tipo', sortable: true },
    { id: 'diagnostico', label: 'Diagnóstico', accessor: 'diagnostico', sortable: true },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; variant: string }> = {
          internado: { label: 'Internado', variant: 'default' },
          alta_medica: { label: 'Alta Médica', variant: 'success' },
          alta_pedida: { label: 'Alta Pedida', variant: 'warning' },
          obito: { label: 'Óbito', variant: 'destructive' },
          transferencia: { label: 'Transferência', variant: 'default' },
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
      id: 'dias',
      label: 'Dias',
      accessor: 'dias_internacao',
      sortable: true,
      render: (value: number | undefined) => (value !== undefined ? `${value} dias` : '-'),
    },
  ];

  // Colunas para tabela de leitos por setor
  const columnsLeitosPorSetor: TableColumn[] = [
    { id: 'setor', label: 'Setor', accessor: 'setor', sortable: true },
    { id: 'livre', label: 'Livre', accessor: 'livre', sortable: true },
    { id: 'ocupado', label: 'Ocupado', accessor: 'ocupado', sortable: true },
    { id: 'total', label: 'Total', accessor: 'total', sortable: true },
  ];

  const charts = [
    {
      id: 'ocupacao_setor',
      title: 'Ocupação por Setor',
      type: 'bar' as const,
      data: mockOcupacaoPorSetor,
      dataKey: 'ocupados',
      xAxisKey: 'setor',
    },
    {
      id: 'internacoes_altas',
      title: 'Internações vs Altas',
      type: 'multi-line' as const,
      data: mockInternacoesPorDia,
      xAxisKey: 'dia',
      lines: [
        { dataKey: 'internacoes', color: 'hsl(200, 98%, 39%)', name: 'Internações' },
        { dataKey: 'altas', color: 'hsl(142, 76%, 36%)', name: 'Altas' },
      ],
    },
  ];

  const handleSetorClick = (row: typeof leitosPorSetor[0]) => {
    setSetorSelecionado(setorSelecionado === row.setor ? null : row.setor);
  };

  return (
    <ModuleLayout
      title="Internação"
      subtitle="Gestão de leitos e internações"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      {/* Cards Principais */}
      <KPIList kpis={kpis} columns={6} />

      {/* Donut Chart - Taxa de Ocupação */}
      <div className="mb-6">
        <ChartCard
          title="Taxa de Ocupação"
          description={`${percentualOcupado}% ocupado vs ${(100 - percentualOcupado).toFixed(2)}% livre`}
        >
          <DonutChart
            data={donutData}
            height={300}
            centerLabel={`${percentualOcupado}%`}
            showLegend={true}
          />
        </ChartCard>
      </div>

      {/* Gráficos Row 1: Tipo de Leito e Ocupação por Convênio */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Tipo de Leito"
          description="Distribuição por tipo de leito"
        >
          <SimplePieChart data={tipoLeitoPieData} height={250} />
        </ChartCard>

        <ChartCard
          title="Ocupação por Convênio"
          description="Top 10 convênios"
        >
          <SimplePieChart data={convenioPieData} height={250} />
        </ChartCard>
      </div>

      {/* Tabela Interativa - Leitos por Setor */}
      <div className="mb-6">
        <ChartCard
          title="Leitos por Setor"
          description="Clique na linha para ver detalhes"
        >
          <DataTable
            columns={columnsLeitosPorSetor}
            data={leitosPorSetor}
            searchable={true}
            searchPlaceholder="Buscar por setor..."
            pagination={{ pageSize: 10, showPagination: true }}
            onRowClick={handleSetorClick}
          />
        </ChartCard>
      </div>

      {/* Gráfico - Ocupação por Especialidade */}
      <div className="mb-6">
        <ChartCard
          title="Ocupação por Especialidade"
          description="Top 10 especialidades"
        >
          <SimplePieChart data={especialidadePieData} height={300} />
        </ChartCard>
      </div>

      {/* Gráficos existentes */}
      <ChartSection charts={charts} columns={2} />

      {/* Tabela de Internações */}
      <DataTable columns={columns} data={mockInternacoes} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
