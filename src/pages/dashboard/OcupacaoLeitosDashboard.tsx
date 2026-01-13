import { useState } from 'react';
import { KPICard, ChartCard, GaugeChart } from '@/components/dashboard';
import { DataTable } from '@/components/modules';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BedDouble, Activity, Download } from 'lucide-react';
import type { Leito, OcupacaoLeito, StatusOcupacao, TableColumn } from '@/types/dashboard';
import {
  calculateOcupacaoPorCentroCusto,
  calculateTaxaOcupacaoGeralLeitos,
  calculateStatusOcupacao,
  calculateEvolucaoOcupacao,
} from '@/lib/business-rules';
import { SimpleAreaChart, SimpleBarChart } from '@/components/dashboard';

// Dados mock inline
const mockLeitos: Leito[] = [
  { id: '1', numero: '101', centro_custo: 'ALA 1', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P001', paciente_nome: 'Maria Silva' },
  { id: '2', numero: '102', centro_custo: 'ALA 1', tipo: 'enfermaria', status: 'disponivel' },
  { id: '3', numero: '103', centro_custo: 'ALA 1', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P002' },
  { id: '4', numero: '201', centro_custo: 'ALA 2 - CLINICA CIRURGICA', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P003' },
  { id: '5', numero: '202', centro_custo: 'ALA 2 - CLINICA CIRURGICA', tipo: 'enfermaria', status: 'disponivel' },
  { id: '6', numero: '301', centro_custo: 'UTI', tipo: 'uti', status: 'ocupado', paciente_id: 'P004' },
  { id: '7', numero: '302', centro_custo: 'UTI', tipo: 'uti', status: 'ocupado', paciente_id: 'P005' },
  { id: '8', numero: '401', centro_custo: 'UTI NEO-NATAL', tipo: 'neonatal', status: 'ocupado', paciente_id: 'P006' },
];

const mockLeitosCadastrados = [
  { centro_custo: 'ALA 1', total: 29 },
  { centro_custo: 'ALA 2 - CLINICA CIRURGICA', total: 26 },
  { centro_custo: 'ALA 3', total: 20 },
  { centro_custo: 'UTI', total: 17 },
  { centro_custo: 'UTI NEO-NATAL', total: 10 },
];

export default function OcupacaoLeitosDashboard() {
  const [periodo, setPeriodo] = useState<'dia' | 'mes'>('mes');
  const [centroCustoSelecionado, setCentroCustoSelecionado] = useState<string>('all');

  // Calcular indicadores
  const taxaOcupacaoGeral = calculateTaxaOcupacaoGeralLeitos(mockLeitos, mockLeitosCadastrados);
  const ocupacaoPorCC = calculateOcupacaoPorCentroCusto(mockLeitos, mockLeitosCadastrados);
  const statusOcupacao = calculateStatusOcupacao(mockLeitos);
  const evolucaoOcupacao = calculateEvolucaoOcupacao(mockLeitos, periodo, periodo === 'dia' ? 7 : 30);

  // KPIs principais
  const kpis = [
    {
      title: 'Taxa de Ocupação Geral',
      value: `${taxaOcupacaoGeral}%`,
      icon: BedDouble,
      variant: 'default' as const,
    },
    {
      title: 'Total de Leitos',
      value: mockLeitosCadastrados.reduce((sum, l) => sum + l.total, 0),
      icon: BedDouble,
      variant: 'default' as const,
    },
    {
      title: 'Leitos Ocupados',
      value: mockLeitos.filter((l) => l.status === 'ocupado' || l.status === 'reservado').length,
      icon: Activity,
      variant: 'default' as const,
    },
    {
      title: 'Leitos Disponíveis',
      value: mockLeitos.filter((l) => l.status === 'disponivel').length,
      icon: BedDouble,
      variant: 'success' as const,
    },
  ];

  // Colunas da tabela de ocupação
  const columnsOcupacao: TableColumn[] = [
    { id: 'centro_custo', label: 'Centro de Custo', accessor: 'centro_custo', sortable: true },
    { id: 'leitos_cadastrados', label: 'Leitos Cadastrados', accessor: 'leitos_cadastrados', sortable: true },
    { id: 'leitos_ocupados', label: 'Leitos Ocupados', accessor: 'leitos_ocupados', sortable: true },
    { id: 'leitos_vagos', label: 'Leitos Vagos', accessor: 'leitos_vagos', sortable: true },
    { id: 'leitos_censo', label: 'Leitos Censo', accessor: 'leitos_censo', sortable: true },
    {
      id: 'taxa_ocupacao',
      label: '% Taxa de Ocupação',
      accessor: 'taxa_ocupacao',
      sortable: true,
      render: (value: number) => (
        <span className={value >= 80 ? 'font-semibold text-destructive' : value >= 60 ? 'font-semibold text-amber-600' : ''}>
          {value}%
        </span>
      ),
    },
  ];

  // Colunas da tabela de status
  const columnsStatus: TableColumn[] = [
    { id: 'centro_custo', label: 'Centro de Custo', accessor: 'centro_custo', sortable: true },
    { id: 'ocupados', label: 'Ocupados', accessor: 'ocupados', sortable: true },
    { id: 'disponiveis', label: 'Disponíveis', accessor: 'disponiveis', sortable: true },
    { id: 'manutencao', label: 'Manutenção', accessor: 'manutencao', sortable: true },
    { id: 'reservados', label: 'Reservados', accessor: 'reservados', sortable: true },
  ];

  return (
    <>
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as 'dia' | 'mes')}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Dia</SelectItem>
              <SelectItem value="mes">Mês</SelectItem>
            </SelectContent>
          </Select>

          <Select value={centroCustoSelecionado} onValueChange={setCentroCustoSelecionado}>
            <SelectTrigger className="w-[200px] bg-card">
              <SelectValue placeholder="Centro de Custo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Centros</SelectItem>
              {mockLeitosCadastrados.map((cc) => (
                <SelectItem key={cc.centro_custo} value={cc.centro_custo}>
                  {cc.centro_custo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      {/* Gauge de Ocupação Geral */}
      <div className="mb-6">
        <ChartCard title="Taxa de Ocupação Geral" description="Indicador visual de ocupação">
          <div className="flex items-center justify-center py-8">
            <GaugeChart value={taxaOcupacaoGeral} label="Ocupação" size="lg" />
          </div>
        </ChartCard>
      </div>

      {/* Tabela de Ocupação por Centro de Custo */}
      <div className="mb-6">
        <ChartCard
          title="Ocupação das Internações por Centro de Custo"
          description="Detalhamento de ocupação por centro de custo"
        >
          <DataTable
            columns={columnsOcupacao}
            data={ocupacaoPorCC}
            searchable={true}
            searchPlaceholder="Buscar por centro de custo..."
            pagination={{ pageSize: 10, showPagination: true }}
          />
        </ChartCard>
      </div>

      {/* Gráficos Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Evolução da Ocupação"
          description={`Últimos ${periodo === 'dia' ? '7' : '30'} dias`}
        >
          <SimpleAreaChart
            data={evolucaoOcupacao}
            dataKey="ocupacao"
            xAxisKey="data"
            height={250}
          />
        </ChartCard>

        <ChartCard title="Status de Ocupação por Centro de Custo" description="Distribuição de status">
          <SimpleBarChart
            data={statusOcupacao.map((s) => ({
              name: s.centro_custo,
              ocupados: s.ocupados,
              disponiveis: s.disponiveis,
              manutencao: s.manutencao,
              reservados: s.reservados,
            }))}
            dataKey="ocupados"
            height={250}
          />
        </ChartCard>
      </div>

      {/* Tabela de Status de Ocupação */}
      <div className="mb-6">
        <ChartCard
          title="Status de Ocupação dos Leitos por Centro de Custo"
          description="Detalhamento de status por centro de custo"
        >
          <DataTable
            columns={columnsStatus}
            data={statusOcupacao}
            searchable={true}
            searchPlaceholder="Buscar por centro de custo..."
            pagination={{ pageSize: 10, showPagination: true }}
          />
        </ChartCard>
      </div>
    </>
  );
}
