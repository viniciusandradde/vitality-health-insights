import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable, ChartSection } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { EstoqueItem, ModuleKPI, ChartData, TableColumn, FilterValues } from '@/types/modules';
import { Package, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

// Dados mock inline
const mockEstoqueItems: EstoqueItem[] = [
  {
    id: '1',
    codigo: 'MED001',
    nome: 'Paracetamol 500mg',
    categoria: 'Medicamentos',
    quantidade_atual: 150,
    quantidade_minima: 50,
    unidade: 'un',
    fornecedor: 'FarmaDistribuidora',
    data_validade: '2025-06-30',
    status: 'disponivel',
  },
  {
    id: '2',
    codigo: 'MED002',
    nome: 'Dipirona 500mg',
    categoria: 'Medicamentos',
    quantidade_atual: 85,
    quantidade_minima: 100,
    unidade: 'un',
    fornecedor: 'FarmaDistribuidora',
    data_validade: '2025-08-15',
    status: 'baixo_estoque',
  },
  {
    id: '3',
    codigo: 'MAT001',
    nome: 'Seringa 5ml',
    categoria: 'Material',
    quantidade_atual: 500,
    quantidade_minima: 200,
    unidade: 'un',
    fornecedor: 'MedSupply Ltda',
    status: 'disponivel',
  },
];

const mockEstoquePorCategoria: ChartData[] = [
  { name: 'Medicamentos', quantidade: 480, valor: 285000 },
  { name: 'Material', quantidade: 2200, valor: 150000 },
  { name: 'Equipamentos', quantidade: 45, valor: 50000 },
];

const mockEstoqueStatus: ChartData[] = [
  { name: 'Disponível', value: 1100 },
  { name: 'Baixo Estoque', value: 120 },
  { name: 'Indisponível', value: 30 },
];

export default function EstoquePage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    periodo: 'today',
  });

  const itensTotal = 1250;
  const itensBaixoEstoque = 12;
  const itensIndisponiveis = 3;
  const valorTotal = 485000;
  const itensVencendo = 8;

  const kpis: ModuleKPI[] = [
    {
      id: 'itens_total',
      title: 'Total de Itens',
      value: itensTotal,
      icon: Package,
      variant: 'default',
    },
    {
      id: 'itens_baixo_estoque',
      title: 'Itens em Baixo Estoque',
      value: itensBaixoEstoque,
      icon: AlertTriangle,
      variant: 'warning',
    },
    {
      id: 'itens_indisponiveis',
      title: 'Itens Indisponíveis',
      value: itensIndisponiveis,
      icon: AlertTriangle,
      variant: 'destructive',
    },
    {
      id: 'valor_total',
      title: 'Valor Total do Estoque',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal),
      icon: DollarSign,
      variant: 'default',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'codigo', label: 'Código', accessor: 'codigo', sortable: true },
    { id: 'nome', label: 'Nome', accessor: 'nome', sortable: true },
    { id: 'categoria', label: 'Categoria', accessor: 'categoria', sortable: true },
    {
      id: 'quantidade',
      label: 'Quantidade',
      accessor: 'quantidade_atual',
      sortable: true,
      render: (value: number, row: EstoqueItem) => (
        <div>
          <span className={value < row.quantidade_minima ? 'text-destructive font-medium' : ''}>
            {value} {row.unidade}
          </span>
          <div className="text-xs text-muted-foreground">Mín: {row.quantidade_minima}</div>
        </div>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; variant: string }> = {
          disponivel: { label: 'Disponível', variant: 'success' },
          baixo_estoque: { label: 'Baixo Estoque', variant: 'warning' },
          vencido: { label: 'Vencido', variant: 'destructive' },
          indisponivel: { label: 'Indisponível', variant: 'destructive' },
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
      id: 'validade',
      label: 'Validade',
      accessor: 'data_validade',
      sortable: true,
      render: (value: string | undefined) => (value ? value : '-'),
    },
  ];

  const charts = [
    {
      id: 'estoque_categoria',
      title: 'Estoque por Categoria',
      type: 'bar' as const,
      data: mockEstoquePorCategoria,
      dataKey: 'quantidade',
      xAxisKey: 'name',
    },
    {
      id: 'estoque_status',
      title: 'Status do Estoque',
      type: 'pie' as const,
      data: mockEstoqueStatus,
    },
  ];

  return (
    <ModuleLayout
      title="Estoque"
      subtitle="Controle de estoque"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <ChartSection charts={charts} columns={2} />
      <DataTable columns={columns} data={mockEstoqueItems} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
