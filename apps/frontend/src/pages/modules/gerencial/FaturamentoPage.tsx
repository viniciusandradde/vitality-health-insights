import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { FaturamentoFatura, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { FileText, AlertCircle, TrendingDown, DollarSign, CheckCircle } from 'lucide-react';

// Dados mock inline
const mockFaturas: FaturamentoFatura[] = [
  {
    id: '1',
    numero: 'FAT-2024-001',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data_emissao: '2024-01-10',
    data_vencimento: '2024-01-25',
    valor: 1500.00,
    valor_pago: 1500.00,
    status: 'pago',
    convenio: 'SUS',
    tipo: 'consulta',
  },
  {
    id: '2',
    numero: 'FAT-2024-002',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data_emissao: '2024-01-10',
    data_vencimento: '2024-01-25',
    valor: 3000.00,
    status: 'pendente',
    convenio: 'Unimed',
    tipo: 'exame',
  },
];

const mockFaturamentoMensal: ChartData[] = [
  { mes: 'Jul', valor: 420000, recebido: 385000 },
  { mes: 'Ago', valor: 445000, recebido: 410000 },
  { mes: 'Set', valor: 460000, recebido: 425000 },
  { mes: 'Out', valor: 480000, recebido: 445000 },
  { mes: 'Nov', valor: 470000, recebido: 435000 },
  { mes: 'Dez', valor: 495000, recebido: 460000 },
  { mes: 'Jan', valor: 485000, recebido: 450000 },
];

const mockFaturasPorStatus: ChartData[] = [
  { name: 'Pago', value: 320 },
  { name: 'Pendente', value: 45 },
  { name: 'Parcial', value: 18 },
  { name: 'Glosado', value: 12 },
];

export default function FaturamentoPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'this_month',
  });

  const faturamento = 485000;
  const faturasPendentes = 45;
  const valorPendente = 125000;
  const taxaGlosas = 8.5;
  const taxaRecebimento = 92;

  const kpis: ModuleKPI[] = [
    {
      id: 'faturamento_mes',
      title: 'Faturamento do Mês',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamento),
      icon: DollarSign,
      trend: { value: 8.5, label: 'vs mês anterior' },
      variant: 'success',
    },
    {
      id: 'faturas_pendentes',
      title: 'Faturas Pendentes',
      value: faturasPendentes,
      icon: AlertCircle,
      variant: 'warning',
    },
    {
      id: 'taxa_glosas',
      title: 'Taxa de Glosas',
      value: `${taxaGlosas}%`,
      icon: TrendingDown,
      trend: { value: -1.2, label: 'vs mês anterior' },
      variant: 'success',
    },
    {
      id: 'taxa_recebimento',
      title: 'Taxa de Recebimento',
      value: `${taxaRecebimento}%`,
      icon: CheckCircle,
      trend: { value: 2.1, label: 'vs mês anterior' },
      variant: 'success',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'numero', label: 'Número', accessor: 'numero', sortable: true },
    { id: 'paciente', label: 'Paciente', accessor: 'paciente_nome', sortable: true },
    { id: 'data_emissao', label: 'Data Emissão', accessor: 'data_emissao', sortable: true },
    { id: 'data_vencimento', label: 'Data Vencimento', accessor: 'data_vencimento', sortable: true },
    {
      id: 'valor',
      label: 'Valor',
      accessor: 'valor',
      sortable: true,
      render: (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
    },
    { id: 'convenio', label: 'Convênio', accessor: 'convenio', sortable: true },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; variant: string }> = {
          pago: { label: 'Pago', variant: 'success' },
          pendente: { label: 'Pendente', variant: 'warning' },
          parcial: { label: 'Parcial', variant: 'warning' },
          glosado: { label: 'Glosado', variant: 'destructive' },
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
  ];

  const charts = [
    {
      id: 'faturamento_mensal',
      title: 'Faturamento Mensal',
      type: 'multi-line' as const,
      data: mockFaturamentoMensal,
      xAxisKey: 'mes',
      lines: [
        { dataKey: 'valor', color: 'hsl(200, 98%, 39%)', name: 'Faturado' },
        { dataKey: 'recebido', color: 'hsl(142, 76%, 36%)', name: 'Recebido' },
      ],
    },
    {
      id: 'faturas_status',
      title: 'Faturas por Status',
      type: 'pie' as const,
      data: mockFaturasPorStatus,
    },
  ];

  return (
    <ModuleLayout
      title="Faturamento"
      subtitle="Gestão de faturamento"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <ChartSection charts={charts} columns={2} />
      <DataTable columns={columns} data={mockFaturas} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
