import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { FinanceiroTransacao, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { Wallet, TrendingUp, TrendingDown, AlertCircle, DollarSign } from 'lucide-react';

// Dados mock inline
const mockTransacoes: FinanceiroTransacao[] = [
  {
    id: '1',
    tipo: 'receita',
    categoria: 'Consultas',
    descricao: 'Consulta Clínica Geral',
    valor: 15000.00,
    data: '2024-01-10',
    status: 'pago',
    paciente: 'Maria Silva',
  },
  {
    id: '2',
    tipo: 'receita',
    categoria: 'Exames',
    descricao: 'Exame de Sangue',
    valor: 8500.00,
    data: '2024-01-10',
    status: 'pago',
    paciente: 'José Oliveira',
  },
  {
    id: '3',
    tipo: 'despesa',
    categoria: 'Fornecedores',
    descricao: 'Material Hospitalar',
    valor: -12000.00,
    data: '2024-01-10',
    status: 'pago',
    fornecedor: 'MedSupply Ltda',
  },
];

const mockReceitaDespesaMensal: ChartData[] = [
  { mes: 'Jul', receita: 420000, despesa: 350000 },
  { mes: 'Ago', receita: 445000, despesa: 365000 },
  { mes: 'Set', receita: 460000, despesa: 340000 },
  { mes: 'Out', receita: 480000, despesa: 355000 },
  { mes: 'Nov', receita: 470000, despesa: 330000 },
  { mes: 'Dez', receita: 495000, despesa: 345000 },
  { mes: 'Jan', receita: 485000, despesa: 320000 },
];

const mockReceitaPorCategoria: ChartData[] = [
  { name: 'Consultas', value: 185000 },
  { name: 'Internações', value: 150000 },
  { name: 'Exames', value: 85000 },
  { name: 'Procedimentos', value: 65000 },
];

export default function FinanceiroPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'this_month',
  });

  const receita = 485000;
  const despesa = 320000;
  const saldo = receita - despesa;
  const receitasPendentes = 45000;
  const despesasVencidas = 8500;

  const kpis: ModuleKPI[] = [
    {
      id: 'receita_mes',
      title: 'Receita do Mês',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receita),
      icon: TrendingUp,
      trend: { value: 8.5, label: 'vs mês anterior' },
      variant: 'success',
    },
    {
      id: 'despesa_mes',
      title: 'Despesa do Mês',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesa),
      icon: TrendingDown,
      trend: { value: -2.3, label: 'vs mês anterior' },
      variant: 'default',
    },
    {
      id: 'saldo_mes',
      title: 'Saldo do Mês',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo),
      icon: DollarSign,
      trend: { value: 15.2, label: 'vs mês anterior' },
      variant: 'success',
    },
    {
      id: 'receitas_pendentes',
      title: 'Receitas Pendentes',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitasPendentes),
      icon: AlertCircle,
      variant: 'warning',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'data', label: 'Data', accessor: 'data', sortable: true },
    { id: 'tipo', label: 'Tipo', accessor: 'tipo', sortable: true },
    { id: 'categoria', label: 'Categoria', accessor: 'categoria', sortable: true },
    { id: 'descricao', label: 'Descrição', accessor: 'descricao', sortable: true },
    {
      id: 'valor',
      label: 'Valor',
      accessor: 'valor',
      sortable: true,
      render: (value: number) => (
        <span className={value < 0 ? 'text-destructive' : 'text-emerald-600'}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; variant: string }> = {
          pago: { label: 'Pago', variant: 'success' },
          pendente: { label: 'Pendente', variant: 'warning' },
          vencido: { label: 'Vencido', variant: 'destructive' },
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
      id: 'receita_despesa',
      title: 'Receita vs Despesa',
      type: 'multi-line' as const,
      data: mockReceitaDespesaMensal,
      xAxisKey: 'mes',
      lines: [
        { dataKey: 'receita', color: 'hsl(142, 76%, 36%)', name: 'Receita' },
        { dataKey: 'despesa', color: 'hsl(0, 72%, 50%)', name: 'Despesa' },
      ],
    },
    {
      id: 'receita_categoria',
      title: 'Receita por Categoria',
      type: 'pie' as const,
      data: mockReceitaPorCategoria,
    },
  ];

  return (
    <ModuleLayout
      title="Financeiro"
      subtitle="Gestão financeira"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <ChartSection charts={charts} columns={2} />
      <DataTable columns={columns} data={mockTransacoes} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
