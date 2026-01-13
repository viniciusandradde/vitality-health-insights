import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { Internacao, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { BedDouble, Activity, TrendingDown, Users } from 'lucide-react';

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
  },
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

  const leitosOcupados = mockInternacoes.filter((i) => i.status === 'internado').length;
  const totalLeitos = 180;
  const taxaOcupacao = Math.round((leitosOcupados / totalLeitos) * 100);
  const tempoMedio = 4.2;

  const kpis: ModuleKPI[] = [
    {
      id: 'leitos_ocupados',
      title: 'Leitos Ocupados',
      value: `${leitosOcupados} / ${totalLeitos}`,
      icon: BedDouble,
      variant: 'default',
    },
    {
      id: 'taxa_ocupacao',
      title: 'Taxa de Ocupação',
      value: `${taxaOcupacao}%`,
      icon: Activity,
      trend: { value: 2.5, label: 'vs ontem' },
      variant: taxaOcupacao > 85 ? 'warning' : 'default',
    },
    {
      id: 'leitos_disponiveis',
      title: 'Leitos Disponíveis',
      value: totalLeitos - leitosOcupados,
      icon: Users,
      variant: 'success',
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

  return (
    <ModuleLayout
      title="Internação"
      subtitle="Gestão de leitos e internações"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <ChartSection charts={charts} columns={2} />
      <DataTable columns={columns} data={mockInternacoes} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
