import { useState } from 'react';
import { KPICard, ChartCard, GaugeChart, TreeMapChart, SimplePieChart } from '@/components/dashboard';
import { DataTable } from '@/components/modules';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BedDouble, Activity, Download, AlertTriangle, CheckCircle, AlertCircle, CreditCard, Building2, Users, Calendar, Hospital } from 'lucide-react';
import type { Leito, OcupacaoLeito, StatusOcupacao, TableColumn, Internacao, KPICritico } from '@/types/dashboard';
import {
  calculateOcupacaoPorCentroCusto,
  calculateTaxaOcupacaoGeralLeitos,
  calculateStatusOcupacao,
  calculateEvolucaoOcupacao,
  calculateLeitoDiaPorCentroCusto,
  calculateOcupacaoPorConvenioTop10,
  calculateOcupacaoPorEspecialidadeTop10,
  calculateKPIsCriticos,
  calculateLeitosOperacionais,
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

// Mock de internações para cálculos
const mockInternacoes: Internacao[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data_entrada: '2024-01-05',
    centro_custo: 'ALA 1',
    medico: 'Dr. João',
    especialidade: 'Clínica Médica',
    proveniencia: 'PS',
    vinculado_ps: true,
    obito: false,
    convenio: 'Unimed',
    dias_permanencia: 5,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data_entrada: '2024-01-08',
    centro_custo: 'ALA 1',
    medico: 'Dr. Pedro',
    especialidade: 'Cardiologia',
    proveniencia: 'PS',
    vinculado_ps: true,
    obito: false,
    convenio: 'SUS',
    dias_permanencia: 2,
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data_entrada: '2024-01-10',
    centro_custo: 'ALA 2 - CLINICA CIRURGICA',
    medico: 'Dr. Ana',
    especialidade: 'Cirurgia Geral',
    proveniencia: 'Ambulatório',
    vinculado_ps: false,
    obito: false,
    convenio: 'Bradesco',
    dias_permanencia: 3,
  },
  {
    id: '4',
    paciente_id: 'P004',
    paciente_nome: 'Ana Costa',
    data_entrada: '2024-01-12',
    centro_custo: 'UTI',
    medico: 'Dr. Carlos',
    especialidade: 'UTI',
    proveniencia: 'PS',
    vinculado_ps: true,
    obito: false,
    convenio: 'Unimed',
    dias_permanencia: 1,
  },
];

export default function OcupacaoLeitosDashboard() {
  const [periodo, setPeriodo] = useState<'dia' | 'mes'>('mes');
  const [centroCustoSelecionado, setCentroCustoSelecionado] = useState<string>('all');

  // Calcular indicadores
  const taxaOcupacaoGeral = calculateTaxaOcupacaoGeralLeitos(mockLeitos, mockLeitosCadastrados);
  const ocupacaoPorCC = calculateOcupacaoPorCentroCusto(mockLeitos, mockLeitosCadastrados);
  const statusOcupacao = calculateStatusOcupacao(mockLeitos);
  const evolucaoOcupacao = calculateEvolucaoOcupacao(mockLeitos, periodo, periodo === 'dia' ? 7 : 30);
  const leitoDiaPorCentroCusto = calculateLeitoDiaPorCentroCusto(mockInternacoes, periodo);
  const ocupacaoPorConvenio = calculateOcupacaoPorConvenioTop10(mockInternacoes);
  const ocupacaoPorEspecialidade = calculateOcupacaoPorEspecialidadeTop10(mockInternacoes);
  const kpisCriticos = calculateKPIsCriticos(mockLeitos, mockLeitosCadastrados);
  const leitosOperacionais = calculateLeitosOperacionais(mockLeitos, mockInternacoes);

  // Calcular Leitos dia sim (Leito-Dia)
  const hoje = new Date().toISOString().split('T')[0];
  const leitosDiaSim = mockInternacoes.filter((i) => {
    const dataEntrada = new Date(i.data_entrada).toISOString().split('T')[0];
    const dataSaida = i.data_saida ? new Date(i.data_saida).toISOString().split('T')[0] : null;
    // Paciente está internado hoje se: entrou hoje ou antes, e não teve alta ou alta é depois de hoje
    return dataEntrada <= hoje && (!dataSaida || dataSaida >= hoje);
  }).length;

  // Total de leitos cadastrados
  const totalLeitos = mockLeitosCadastrados.reduce((sum, l) => sum + l.total, 0);

  // Dados para Pie Charts
  const convenioPieData = ocupacaoPorConvenio.map((c) => ({
    name: c.convenio,
    value: c.percentual,
  }));

  const especialidadePieData = ocupacaoPorEspecialidade.map((e) => ({
    name: e.especialidade,
    value: e.percentual,
  }));

  // KPIs principais - Cards ordenados conforme a imagem
  const kpis = [
    {
      title: 'Convênio e Particulares',
      value: leitosOperacionais.convenio,
      icon: CreditCard,
      variant: 'default' as const,
    },
    {
      title: 'SUS',
      value: leitosOperacionais.sus,
      icon: Building2,
      variant: 'default' as const,
    },
    {
      title: 'Ocupado',
      value: leitosOperacionais.ocupado,
      icon: BedDouble,
      variant: leitosOperacionais.ocupado > totalLeitos * 0.85 ? 'warning' : 'default' as const,
    },
    {
      title: 'Livre',
      value: leitosOperacionais.livre,
      icon: Users,
      variant: 'success' as const,
    },
    {
      title: 'Leitos dia sim',
      value: leitosDiaSim,
      icon: Calendar,
      variant: 'default' as const,
    },
    {
      title: 'Total de Leitos',
      value: totalLeitos,
      icon: Hospital,
      variant: 'default' as const,
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

      {/* KPIs - 6 cards em layout responsivo */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      {/* Alertas de KPIs Críticos */}
      <div className="mb-6 space-y-3">
        {kpisCriticos.map((kpi) => {
          const Icon =
            kpi.status === 'ideal'
              ? CheckCircle
              : kpi.status === 'atencao'
              ? AlertCircle
              : AlertTriangle;
          const variant = kpi.status === 'critico' ? 'destructive' : 'default';
          const borderColor =
            kpi.status === 'ideal'
              ? 'border-emerald-500/50'
              : kpi.status === 'atencao'
              ? 'border-amber-500/50'
              : 'border-destructive/50';

          return (
            <Alert key={kpi.id} variant={variant} className={borderColor}>
              <Icon className="h-4 w-4" />
              <AlertTitle>{kpi.titulo}</AlertTitle>
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {kpi.mensagem} - Valor atual: <strong>{kpi.valor}%</strong>
                    {kpi.ideal.min !== undefined && ` (Ideal: ≥${kpi.ideal.min}%)`}
                    {kpi.ideal.max !== undefined && ` (Ideal: ≤${kpi.ideal.max}%)`}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          );
        })}
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

      {/* TreeMap - Leito Dia por Centro de Custo */}
      <div className="mb-6">
        <ChartCard
          title="Leito Dia por Centro de Custo"
          description="Distribuição hierárquica de leitos-dia por centro de custo"
        >
          <TreeMapChart data={leitoDiaPorCentroCusto} height={400} />
        </ChartCard>
      </div>

      {/* Pie Charts - Ocupação por Convênio e Especialidade */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Ocupação por Convênio"
          description="Top 10 convênios"
        >
          <SimplePieChart data={convenioPieData} height={300} />
        </ChartCard>

        <ChartCard
          title="Ocupação por Especialidade"
          description="Top 10 especialidades"
        >
          <SimplePieChart data={especialidadePieData} height={300} />
        </ChartCard>
      </div>
    </>
  );
}
