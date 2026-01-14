import { useState } from 'react';
import { KPICard, ChartCard } from '@/components/dashboard';
import { DataTable } from '@/components/modules';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users, Activity, Calendar, Clock, Download } from 'lucide-react';
import type { Atendimento, TableColumn } from '@/types/dashboard';
import {
  calculateAtendimentosPorTipo,
  calculateAtendimentosAmbulatoriais,
  calculateAtendimentosPorCategoriaConvenio,
  calculateAtendimentosPorConvenio,
  calculateAtendimentosPorTipoServico,
  calculateTopEspecialidades,
  calculateEspecialidadesPorCentroCusto,
  calculateAtendimentosPorFaixaEtaria,
  calculateAtendimentosPorHorario,
} from '@/lib/business-rules';
import { SimpleBarChart, SimplePieChart, SimpleAreaChart } from '@/components/dashboard';

// Dados mock inline
const mockAtendimentos: Atendimento[] = [
  {
    id: '1',
    paciente_id: 'P001',
    paciente_nome: 'Maria Silva',
    data: '2024-01-10',
    hora: '08:00',
    tipo: 'Consulta',
    tipo_servico: 'Ambulatorial',
    especialidade: 'Clínica Geral',
    centro_custo: 'Ambulatório',
    convenio: 'SUS',
    categoria_convenio: 'SUS',
    faixa_etaria: '30-40',
    idade: 35,
  },
  {
    id: '2',
    paciente_id: 'P002',
    paciente_nome: 'José Oliveira',
    data: '2024-01-10',
    hora: '09:30',
    tipo: 'Exame',
    tipo_servico: 'Diagnóstico',
    especialidade: 'Cardiologia',
    centro_custo: 'Ambulatório',
    convenio: 'Unimed',
    categoria_convenio: 'convenio',
    faixa_etaria: '50-60',
    idade: 55,
  },
  {
    id: '3',
    paciente_id: 'P003',
    paciente_nome: 'Pedro Alves',
    data: '2024-01-10',
    hora: '14:00',
    tipo: 'Procedimento',
    tipo_servico: 'Cirúrgico',
    especialidade: 'Ortopedia',
    centro_custo: 'Ambulatório',
    convenio: 'Bradesco',
    categoria_convenio: 'convenio',
    faixa_etaria: '40-50',
    idade: 45,
  },
];

export default function AtendimentosDashboard() {
  const [periodo, setPeriodo] = useState<'dia' | 'mes'>('mes');
  const [centroCustoSelecionado, setCentroCustoSelecionado] = useState<string>('all');

  // Calcular indicadores
  const atendimentosPorTipo = calculateAtendimentosPorTipo(mockAtendimentos, periodo);
  const totalAmbulatoriais = calculateAtendimentosAmbulatoriais(mockAtendimentos, periodo);
  const atendimentosPorCategoria = calculateAtendimentosPorCategoriaConvenio(mockAtendimentos, periodo);
  const atendimentosPorConvenio = calculateAtendimentosPorConvenio(mockAtendimentos, periodo);
  const atendimentosPorTipoServico = calculateAtendimentosPorTipoServico(mockAtendimentos);
  const topEspecialidades = calculateTopEspecialidades(mockAtendimentos, periodo, 10);
  const especialidadesPorCC = calculateEspecialidadesPorCentroCusto(mockAtendimentos);
  const atendimentosPorFaixaEtaria = calculateAtendimentosPorFaixaEtaria(mockAtendimentos, periodo);
  const atendimentosPorHorario = calculateAtendimentosPorHorario(mockAtendimentos);

  // KPIs principais
  const kpis = [
    {
      title: 'Total Atendimentos Ambulatoriais',
      value: totalAmbulatoriais,
      icon: Users,
      variant: 'default' as const,
    },
    {
      title: 'Atendimentos por Tipo',
      value: Object.keys(atendimentosPorTipo).length,
      icon: Activity,
      variant: 'default' as const,
    },
    {
      title: 'Top Especialidade',
      value: topEspecialidades[0]?.especialidade || 'N/A',
      icon: Calendar,
      variant: 'default' as const,
    },
    {
      title: 'Total Convênios',
      value: atendimentosPorConvenio.length,
      icon: Users,
      variant: 'default' as const,
    },
  ];

  // Colunas da tabela de atendimentos por convênio
  const columnsConvenio: TableColumn[] = [
    { id: 'convenio', label: 'Convênio', accessor: 'convenio', sortable: true },
    { id: 'total', label: 'Total Atendimentos', accessor: 'total', sortable: true },
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
              <SelectItem value="ambulatorio">Ambulatório</SelectItem>
              <SelectItem value="emergencia">Emergência</SelectItem>
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

      {/* Gráficos Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Atendimentos por Tipo" description={`Distribuição por tipo (${periodo})`}>
          <SimpleBarChart
            data={Object.entries(atendimentosPorTipo).map(([name, value]) => ({ name, value }))}
            dataKey="value"
            height={250}
          />
        </ChartCard>

        <ChartCard title="Atendimentos por Categoria de Convênio" description={`Distribuição por categoria (${periodo})`}>
          <div className="flex items-center justify-center">
            <SimplePieChart
              data={Object.entries(atendimentosPorCategoria).map(([name, value]) => ({ name, value }))}
              height={220}
            />
          </div>
        </ChartCard>
      </div>

      {/* Tabela de Atendimentos por Convênio */}
      <div className="mb-6">
        <ChartCard
          title="Atendimentos por Convênio"
          description={`Lista de convênios e total de atendimentos (${periodo})`}
        >
          <DataTable
            columns={columnsConvenio}
            data={atendimentosPorConvenio}
            searchable={true}
            searchPlaceholder="Buscar por convênio..."
            pagination={{ pageSize: 10, showPagination: true }}
          />
        </ChartCard>
      </div>

      {/* Gráficos Row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Atendimentos por Tipo de Serviço" description="Distribuição mensal">
          <SimpleBarChart
            data={Object.entries(atendimentosPorTipoServico).map(([name, value]) => ({ name, value }))}
            dataKey="value"
            height={250}
          />
        </ChartCard>

        <ChartCard title="Top 10 Especialidades" description={`Maiores especialidades em atendimento (${periodo})`}>
          <SimpleBarChart
            data={topEspecialidades.map((e) => ({ name: e.especialidade, value: e.quantidade }))}
            dataKey="value"
            height={250}
          />
        </ChartCard>
      </div>

      {/* Gráficos Row 3 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Atendimentos por Faixa Etária" description={`Distribuição por idade (${periodo})`}>
          <SimpleBarChart
            data={Object.entries(atendimentosPorFaixaEtaria).map(([name, value]) => ({ name, value }))}
            dataKey="value"
            height={250}
          />
        </ChartCard>

        <ChartCard title="Atendimentos por Faixa Horária" description="Distribuição ao longo do dia (mês)">
          <SimpleAreaChart
            data={atendimentosPorHorario}
            dataKey="quantidade"
            xAxisKey="horario"
            height={250}
          />
        </ChartCard>
      </div>
    </>
  );
}
