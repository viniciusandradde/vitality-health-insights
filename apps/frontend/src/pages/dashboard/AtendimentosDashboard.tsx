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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Activity, Calendar, Clock, Download, Loader2, AlertTriangle } from 'lucide-react';
import type { TableColumn } from '@/types/dashboard';
import { SimpleBarChart, SimplePieChart, SimpleAreaChart } from '@/components/dashboard';
import { useAtendimentos } from '@/hooks/useErpDashboard';

export default function AtendimentosDashboard() {
  const [periodo, setPeriodo] = useState<'dia' | 'mes'>('mes');
  const [centroCustoSelecionado, setCentroCustoSelecionado] = useState<string>('all');

  const { data, isLoading, error, refetch } = useAtendimentos({
    periodo,
    centro_custo: centroCustoSelecionado !== 'all' ? centroCustoSelecionado : undefined,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados: {error.message}
          <Button
            variant="outline"
            size="sm"
            className="ml-4"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Mapear dados da API
  const kpisData = data?.kpis;
  const porTipo = data?.por_tipo || [];
  const porCategoria = data?.por_categoria_convenio || {};
  const porConvenio = data?.por_convenio || [];
  const topEspecialidades = data?.top_especialidades || [];
  const porFaixaEtaria = data?.por_faixa_etaria || {};
  const porHorario = data?.por_horario || [];

  // KPIs principais
  const kpis = [
    {
      title: 'Total Atendimentos Ambulatoriais',
      value: kpisData?.total_ambulatoriais?.toString() || '0',
      icon: Users,
      variant: 'default' as const,
    },
    {
      title: 'Atendimentos por Tipo',
      value: kpisData?.tipos_atendimento?.toString() || '0',
      icon: Activity,
      variant: 'default' as const,
    },
    {
      title: 'Top Especialidade',
      value: kpisData?.top_especialidade || 'N/A',
      icon: Calendar,
      variant: 'default' as const,
    },
    {
      title: 'Total Convênios',
      value: kpisData?.total_convenios?.toString() || '0',
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
        {porTipo.length > 0 && (
          <ChartCard title="Atendimentos por Tipo" description={`Distribuição por tipo (${periodo})`}>
            <SimpleBarChart
              data={porTipo}
              dataKey="value"
              height={250}
            />
          </ChartCard>
        )}

        {Object.keys(porCategoria).length > 0 && (
          <ChartCard title="Atendimentos por Categoria de Convênio" description={`Distribuição por categoria (${periodo})`}>
            <div className="flex items-center justify-center">
              <SimplePieChart
                data={Object.entries(porCategoria).map(([name, value]) => ({ name, value }))}
                height={220}
              />
            </div>
          </ChartCard>
        )}
      </div>

      {/* Tabela de Atendimentos por Convênio */}
      {porConvenio.length > 0 && (
        <div className="mb-6">
          <ChartCard
            title="Atendimentos por Convênio"
            description={`Lista de convênios e total de atendimentos (${periodo})`}
          >
            <DataTable
              columns={columnsConvenio}
              data={porConvenio}
              searchable={true}
              searchPlaceholder="Buscar por convênio..."
              pagination={{ pageSize: 10, showPagination: true }}
            />
          </ChartCard>
        </div>
      )}

      {/* Gráficos Row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {topEspecialidades.length > 0 && (
          <ChartCard title="Top 10 Especialidades" description={`Maiores especialidades em atendimento (${periodo})`}>
            <SimpleBarChart
              data={topEspecialidades}
              dataKey="value"
              height={250}
            />
          </ChartCard>
        )}

        {porHorario.length > 0 && (
          <ChartCard title="Atendimentos por Faixa Horária" description="Distribuição ao longo do dia (mês)">
            <SimpleAreaChart
              data={porHorario.map(h => ({ horario: h.horario, quantidade: h.quantidade }))}
              dataKey="quantidade"
              xAxisKey="horario"
              height={250}
            />
          </ChartCard>
        )}
      </div>

      {/* Gráficos Row 3 */}
      {Object.keys(porFaixaEtaria).length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Atendimentos por Faixa Etária" description={`Distribuição por idade (${periodo})`}>
            <SimpleBarChart
              data={Object.entries(porFaixaEtaria).map(([name, value]) => ({ name, value }))}
              dataKey="value"
              height={250}
            />
          </ChartCard>
        </div>
      )}
    </>
  );
}
