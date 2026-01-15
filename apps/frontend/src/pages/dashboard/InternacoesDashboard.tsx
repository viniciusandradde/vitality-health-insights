import { useState } from 'react';
import { KPICard } from '@/components/dashboard';
import { ChartCard } from '@/components/dashboard';
import { DataTable } from '@/components/modules';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  BedDouble,
  Clock,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
  Download,
} from 'lucide-react';
import type {
  Internacao,
  Leito,
  OcupacaoLeito,
  OcupacaoPorConvenio,
  TableColumn,
} from '@/types/dashboard';
import {
  calculateTaxaOcupacaoGeral,
  calculateTaxaOcupacaoPorCentroCusto,
  calculateMediaPermanencia,
  calculateMediaPermanenciaPorCentroCusto,
  calculateIntervaloSubstituicao,
  calculateIntervaloSubstituicaoPorCentroCusto,
  calculateRotatividadeLeitos,
  calculateRotatividadePorCentroCusto,
  calculateEntradasSaidas,
  calculateObitos,
  calculateInternacoesPSPorMedico,
  calculateInternacoesPSPorEspecialidade,
  calculateClassificacaoRisco,
  calculateTopProveniencias,
  calculateProvenienciaPorCentroCusto,
  calculatePacienteDiaLeitoDia,
} from '@/lib/business-rules';
import {
  calculateOcupacaoPorCentroCusto,
  calculateOcupacaoPorConvenio,
} from '@/lib/business-rules';
import { calculateCCIHKPIs } from '@/lib/business-rules';
import type { CCIHInfeccao, CCIHIsolamento } from '@/types/modules';
import { SimpleAreaChart, SimpleBarChart, MultiLineChart } from '@/components/dashboard';

// Dados mock inline
const mockInternacoes: Internacao[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data_entrada: '2024-01-10',
    data_saida: '2024-01-15',
    centro_custo: 'ALA 1',
    medico: 'Dr. João Santos',
    especialidade: 'Clínica Geral',
    classificacao_risco: 'amarelo',
    proveniencia: 'Pronto Socorro',
    vinculado_ps: true,
    obito: false,
    dias_permanencia: 5,
    convenio: 'SUS',
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data_entrada: '2024-01-08',
    data_saida: '2024-01-12',
    centro_custo: 'ALA 2 - CLINICA CIRURGICA',
    medico: 'Dra. Ana Costa',
    especialidade: 'Cirurgia',
    classificacao_risco: 'vermelho',
    proveniencia: 'Ambulatório',
    vinculado_ps: false,
    obito: false,
    dias_permanencia: 4,
    convenio: 'Unimed',
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data_entrada: '2024-01-05',
    data_saida: '2024-01-09',
    centro_custo: 'UTI',
    medico: 'Dr. Carlos Mendes',
    especialidade: 'UTI',
    classificacao_risco: 'vermelho',
    proveniencia: 'Pronto Socorro',
    vinculado_ps: true,
    obito: true,
    dias_permanencia: 4,
    convenio: 'SUS',
  },
];

const mockLeitos: Leito[] = [
  { id: '1', numero: '101', centro_custo: 'ALA 1', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P001' },
  { id: '2', numero: '102', centro_custo: 'ALA 1', tipo: 'enfermaria', status: 'disponivel' },
  { id: '3', numero: '201', centro_custo: 'ALA 2 - CLINICA CIRURGICA', tipo: 'enfermaria', status: 'ocupado', paciente_id: 'P002' },
  { id: '4', numero: '301', centro_custo: 'UTI', tipo: 'uti', status: 'ocupado', paciente_id: 'P003' },
];

const mockLeitosCadastrados = [
  { centro_custo: 'ALA 1', total: 29 },
  { centro_custo: 'ALA 2 - CLINICA CIRURGICA', total: 26 },
  { centro_custo: 'ALA 3', total: 20 },
  { centro_custo: 'UTI', total: 17 },
  { centro_custo: 'UTI NEO-NATAL', total: 10 },
];

// Mock dados CCIH para cálculo de infecção hospitalar
const mockInfeccoes: CCIHInfeccao[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-10',
    tipo_infeccao: 'Pneumonia',
    topografia: 'Pulmão',
    isolamento: true,
    antimicrobiano: 'Ceftriaxona',
    desfecho: 'em_tratamento',
    sitio_cirurgico: false,
    iras: true,
  },
];

const mockIsolamentos: CCIHIsolamento[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data_inicio: '2024-01-10',
    tipo_isolamento: 'precaucao_aerossol',
    motivo: 'Pneumonia',
    dias_isolamento: 5,
  },
];

export default function InternacoesDashboard() {
  const [periodo, setPeriodo] = useState<'dia' | 'mes'>('mes');
  const [centroCustoSelecionado, setCentroCustoSelecionado] = useState<string>('all');
  const [centroCustoDetalhe, setCentroCustoDetalhe] = useState<string | null>(null);

  // Calcular indicadores
  const taxaOcupacaoGeral = calculateTaxaOcupacaoGeral(mockInternacoes, mockLeitosCadastrados, periodo);
  const taxaOcupacaoPorCC = calculateTaxaOcupacaoPorCentroCusto(mockInternacoes, mockLeitosCadastrados, periodo);
  const mediaPermanencia = calculateMediaPermanencia(mockInternacoes, periodo);
  const mediaPermanenciaPorCC = calculateMediaPermanenciaPorCentroCusto(mockInternacoes);
  const intervaloSubstituicao = calculateIntervaloSubstituicao(mockInternacoes, periodo);
  const intervaloSubstituicaoPorCC = calculateIntervaloSubstituicaoPorCentroCusto(mockInternacoes);
  const rotatividade = calculateRotatividadeLeitos(mockInternacoes, periodo);
  const rotatividadePorCC = calculateRotatividadePorCentroCusto(mockInternacoes, periodo);
  const entradasSaidas = calculateEntradasSaidas(mockInternacoes, periodo);
  const obitos = calculateObitos(mockInternacoes, periodo);
  const internacoesPSPorMedico = calculateInternacoesPSPorMedico(mockInternacoes, periodo);
  const internacoesPSPorEspecialidade = calculateInternacoesPSPorEspecialidade(mockInternacoes, periodo);
  const classificacaoRisco = calculateClassificacaoRisco(mockInternacoes, periodo);
  const topProveniencias = calculateTopProveniencias(mockInternacoes, periodo, 10);
  const provenienciaPorCC = calculateProvenienciaPorCentroCusto(mockInternacoes);
  const pacienteDiaLeitoDia = calculatePacienteDiaLeitoDia(mockInternacoes, periodo);
  const ocupacaoPorCC = calculateOcupacaoPorCentroCusto(mockLeitos, mockLeitosCadastrados);
  const ocupacaoPorConvenio = calculateOcupacaoPorConvenio(mockInternacoes, mockLeitos);
  const ccihKPIs = calculateCCIHKPIs(mockInfeccoes, mockIsolamentos);

  // KPIs principais
  const kpis = [
    {
      title: 'Taxa de Ocupação',
      value: `${taxaOcupacaoGeral}%`,
      icon: BedDouble,
      variant: 'default' as const,
    },
    {
      title: 'Média de Permanência',
      value: `${mediaPermanencia} dias`,
      icon: Clock,
      variant: 'default' as const,
    },
    {
      title: 'Intervalo de Substituição',
      value: `${intervaloSubstituicao} dias`,
      icon: Activity,
      variant: 'default' as const,
    },
    {
      title: 'Rotatividade dos Leitos',
      value: rotatividade,
      icon: TrendingUp,
      variant: 'default' as const,
    },
    {
      title: 'Óbitos',
      value: obitos,
      icon: AlertTriangle,
      variant: 'destructive' as const,
    },
    {
      title: 'Internações PS',
      value: internacoesPSPorMedico.reduce((sum, i) => sum + i.quantidade, 0),
      icon: Users,
      variant: 'default' as const,
    },
    {
      title: 'Infecção Hospitalar',
      value: `${ccihKPIs.taxaInfeccaoHospitalar} por 1000`,
      icon: AlertTriangle,
      variant: 'destructive' as const,
    },
  ];

  // Colunas da tabela de ocupação por centro de custo
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
      render: (value: number) => `${value}%`,
    },
  ];

  const handleRowClick = (row: OcupacaoLeito) => {
    setCentroCustoDetalhe(row.centro_custo);
  };

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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      {/* Gráficos Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Entradas x Saídas"
          description={`Últimos ${periodo === 'dia' ? '7' : '30'} dias`}
        >
          <MultiLineChart
            data={entradasSaidas}
            xAxisKey="data"
            height={250}
            lines={[
              { dataKey: 'entradas', color: 'hsl(142, 76%, 36%)', name: 'Entradas' },
              { dataKey: 'saidas', color: 'hsl(0, 72%, 50%)', name: 'Saídas' },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Paciente-Dia x Leito-Dia"
          description={`Últimos ${periodo === 'dia' ? '7' : '30'} dias`}
        >
          <MultiLineChart
            data={pacienteDiaLeitoDia}
            xAxisKey="data"
            height={250}
            lines={[
              { dataKey: 'paciente_dia', color: 'hsl(200, 98%, 39%)', name: 'Paciente-Dia' },
              { dataKey: 'leito_dia', color: 'hsl(38, 92%, 50%)', name: 'Leito-Dia' },
            ]}
          />
        </ChartCard>
      </div>

      {/* Tabela de Ocupação por Centro de Custo */}
      <div className="mb-6">
        <ChartCard
          title="Ocupação das Internações por Centro de Custo"
          description="Clique na linha para visualizar detalhes por convênio"
        >
          <DataTable
            columns={columnsOcupacao}
            data={ocupacaoPorCC}
            searchable={true}
            searchPlaceholder="Buscar por centro de custo..."
            pagination={{ pageSize: 10, showPagination: true }}
            onRowClick={handleRowClick}
          />
        </ChartCard>
      </div>

      {/* Detalhes por Convênio (quando linha é clicada) */}
      {centroCustoDetalhe && ocupacaoPorConvenio[centroCustoDetalhe] && (
        <div className="mb-6">
          <ChartCard
            title={`Centro de Custo: ${centroCustoDetalhe} por Convênio`}
            description="Distribuição de internações por convênio"
          >
            <DataTable
              columns={[
                { id: 'convenio', label: 'Convênio', accessor: 'convenio', sortable: true },
                { id: 'total_internacoes', label: 'Total Internações', accessor: 'total_internacoes', sortable: true },
                { id: 'leitos_ocupados', label: 'Leitos Ocupados', accessor: 'leitos_ocupados', sortable: true },
              ]}
              data={ocupacaoPorConvenio[centroCustoDetalhe]}
              searchable={true}
              pagination={{ pageSize: 10, showPagination: true }}
            />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setCentroCustoDetalhe(null)}>
                Voltar
              </Button>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Gráficos Row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Top 10 Proveniências" description="Maiores proveniências de pacientes">
          <SimpleBarChart
            data={topProveniencias.map((p) => ({ name: p.proveniencia, value: p.quantidade }))}
            dataKey="value"
            height={250}
          />
        </ChartCard>

        <ChartCard title="Classificação de Risco" description="Distribuição por classificação">
          <SimpleBarChart
            data={classificacaoRisco.map((c) => ({ name: c.classificacao, value: c.quantidade }))}
            dataKey="value"
            height={250}
          />
        </ChartCard>
      </div>

      {/* Gráficos Row 3 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Internações PS por Médico" description="Médicos que mais internam via PS">
          <SimpleBarChart
            data={internacoesPSPorMedico.map((i) => ({ name: i.medico, value: i.quantidade }))}
            dataKey="value"
            height={250}
          />
        </ChartCard>

        <ChartCard title="Internações PS por Especialidade" description="Especialidades que mais internam via PS">
          <SimpleBarChart
            data={internacoesPSPorEspecialidade.map((i) => ({ name: i.especialidade, value: i.quantidade }))}
            dataKey="value"
            height={250}
          />
        </ChartCard>
      </div>

      {/* Gráfico de Infecção Hospitalar */}
      <div className="mb-6">
        <ChartCard
          title="Infecção Hospitalar"
          description={`Taxa de infecção hospitalar por ${periodo === 'dia' ? 'dia' : 'mês'}`}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Taxa Geral</p>
              <p className="text-2xl font-bold">{ccihKPIs.taxaInfeccaoHospitalar} por 1000</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Taxa IRAS</p>
              <p className="text-2xl font-bold">{ccihKPIs.taxaIRAS} por 1000</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Pacientes em Isolamento</p>
              <p className="text-2xl font-bold">{ccihKPIs.pacientesIsolamento}</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </>
  );
}
