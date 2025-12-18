import { useState } from 'react';
import {
  Users,
  Clock,
  BedDouble,
  Activity,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Download,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  KPICard,
  ChartCard,
  GaugeChart,
  SimpleAreaChart,
  SimpleBarChart,
  SimplePieChart,
  MultiLineChart,
} from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { kpiApi } from '@/api/endpoints/kpi';

export default function Dashboard() {
  const [period, setPeriod] = useState<string>('today');
  const [sector, setSector] = useState<string>('all');

  const filters = {
    period: period === 'today' ? 'today' : period,
    sector: sector === 'all' ? undefined : sector,
  };

  const { data: dashboardKPIs, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ['dashboard-kpis', filters],
    queryFn: () => kpiApi.getDashboardKPIs(filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: atendimentosHora, isLoading: horaLoading } = useQuery({
    queryKey: ['atendimentos-hora', filters],
    queryFn: () => kpiApi.getAtendimentosPorHora(filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: ocupacaoSetor, isLoading: ocupacaoLoading } = useQuery({
    queryKey: ['ocupacao-setor', filters],
    queryFn: () => kpiApi.getOcupacaoPorSetor(filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: especialidadesData, isLoading: especialidadesLoading } = useQuery({
    queryKey: ['especialidades', filters],
    queryFn: () => kpiApi.getEspecialidadesData(filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: conveniosData, isLoading: conveniosLoading } = useQuery({
    queryKey: ['convenios', filters],
    queryFn: () => kpiApi.getConveniosData(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Transformar ocupacaoSetor para formato do gráfico
  const ocupacaoSemanal = ocupacaoSetor?.reduce((acc: any, item: any) => {
    const setorKey = item.setor.toLowerCase().includes('uti') ? 'uti' : 
                     item.setor.toLowerCase().includes('enfermaria') ? 'enfermaria' : 
                     item.setor.toLowerCase().includes('emergencia') ? 'emergencia' : 'outros';
    
    // Criar estrutura básica se não existir
    if (!acc[setorKey]) {
      acc[setorKey] = {};
    }
    
    // Adicionar dados (simplificado - em produção, seria necessário agrupar por dia)
    acc[setorKey] = item.taxa;
    
    return acc;
  }, {}) || {};

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do hospital">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os setores</SelectItem>
              <SelectItem value="emergencia">Emergência</SelectItem>
              <SelectItem value="uti">UTI</SelectItem>
              <SelectItem value="enfermaria">Enfermaria</SelectItem>
              <SelectItem value="ambulatorio">Ambulatório</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPI Cards */}
      {kpisLoading ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      ) : kpisError ? (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
          Erro ao carregar KPIs. Tente novamente.
        </div>
      ) : dashboardKPIs ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Atendimentos Hoje"
              value={dashboardKPIs.atendimentos_hoje?.toString() || '0'}
              icon={Users}
              variant="default"
            />
            <KPICard
              title="Tempo Médio Espera"
              value={`${Math.round(dashboardKPIs.tempo_medio_espera || 0)} min`}
              icon={Clock}
              variant={dashboardKPIs.tempo_medio_espera < 30 ? 'success' : 'default'}
            />
            <KPICard
              title="Taxa Ocupação UTI"
              value={`${Math.round(dashboardKPIs.taxa_ocupacao_uti || 0)}%`}
              icon={BedDouble}
              variant={dashboardKPIs.taxa_ocupacao_uti > 85 ? 'warning' : 'default'}
            />
            <KPICard
              title="Agendamentos Hoje"
              value={dashboardKPIs.agendamentos_hoje?.toString() || '0'}
              icon={Activity}
              variant="default"
            />
          </div>

          {/* Secondary KPIs */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Leitos Disponíveis"
              value={dashboardKPIs.leitos_disponiveis?.toString() || '0'}
              icon={BedDouble}
              variant="success"
            />
            <KPICard
              title="Exames Pendentes"
              value={dashboardKPIs.exames_pendentes?.toString() || '0'}
              icon={Calendar}
              variant={dashboardKPIs.exames_pendentes > 50 ? 'warning' : 'default'}
            />
            <KPICard
              title="Altas Previstas"
              value={dashboardKPIs.altas_previstas?.toString() || '0'}
              icon={CheckCircle}
              variant="success"
              description="para hoje"
            />
            <KPICard
              title="Taxa Ocupação UTI"
              value={`${Math.round(dashboardKPIs.taxa_ocupacao_uti || 0)}%`}
              icon={BedDouble}
              variant={dashboardKPIs.taxa_ocupacao_uti > 85 ? 'warning' : 'default'}
            />
          </div>
        </>
      ) : null}

      {/* Charts Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Atendimentos por Hora"
          description="Últimas 24 horas"
          actions={
            <Button variant="ghost" size="sm">
              Ver detalhes
            </Button>
          }
        >
          {horaLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : atendimentosHora && atendimentosHora.length > 0 ? (
            <SimpleAreaChart data={atendimentosHora} dataKey="value" xAxisKey="hora" height={250} />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Ocupação por Setor"
          description="Comparativo de ocupação"
        >
          {ocupacaoLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : ocupacaoSetor && ocupacaoSetor.length > 0 ? (
            <SimpleBarChart
              data={ocupacaoSetor.map((item: any) => ({
                name: item.setor,
                value: item.taxa,
              }))}
              dataKey="value"
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Top 5 Especialidades" description="Por volume de atendimentos">
          {especialidadesLoading ? (
            <div className="flex items-center justify-center h-[220px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : especialidadesData && especialidadesData.length > 0 ? (
            <SimpleBarChart data={especialidadesData} dataKey="value" height={220} />
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>

        <ChartCard title="Distribuição por Convênio" description="Atendimentos do mês">
          {conveniosLoading ? (
            <div className="flex items-center justify-center h-[220px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : conveniosData && conveniosData.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <SimplePieChart data={conveniosData} height={220} />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {conveniosData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: [
                          'hsl(200, 98%, 39%)',
                          'hsl(142, 76%, 36%)',
                          'hsl(38, 92%, 50%)',
                          'hsl(0, 72%, 50%)',
                          'hsl(262, 83%, 58%)',
                        ][index],
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>

        <ChartCard title="Indicadores de Qualidade" description="Métricas em tempo real">
          {kpisLoading ? (
            <div className="flex items-center justify-center h-[220px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : dashboardKPIs ? (
            <div className="flex flex-col items-center justify-center gap-6 py-4">
              <GaugeChart 
                value={Math.round(dashboardKPIs.taxa_ocupacao_uti || 0)} 
                label="Taxa de Ocupação UTI" 
                size="lg" 
              />
              <div className="grid grid-cols-2 gap-8">
                <GaugeChart 
                  value={dashboardKPIs.tempo_medio_espera < 30 ? 92 : 78} 
                  label="SLA Atendimento" 
                  size="md" 
                  variant={dashboardKPIs.tempo_medio_espera < 30 ? 'success' : 'default'}
                />
                <GaugeChart 
                  value={Math.round((dashboardKPIs.leitos_disponiveis || 0) / 180 * 100)} 
                  label="Leitos Disponíveis" 
                  size="md" 
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <ChartCard title="Atividade Recente" description="Últimas atualizações do sistema">
        <div className="space-y-4">
          {[
            { time: '14:32', event: 'Alta médica', patient: 'Paciente #4521', sector: 'Enfermaria B', status: 'success' },
            { time: '14:28', event: 'Internação UTI', patient: 'Paciente #4589', sector: 'UTI Adulto', status: 'warning' },
            { time: '14:15', event: 'Cirurgia concluída', patient: 'Paciente #4432', sector: 'Centro Cirúrgico', status: 'success' },
            { time: '14:05', event: 'Exame liberado', patient: 'Paciente #4601', sector: 'Laboratório', status: 'default' },
            { time: '13:58', event: 'Alerta crítico', patient: 'Paciente #4523', sector: 'UTI Neonatal', status: 'destructive' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg border border-border bg-background p-3"
            >
              <span className="text-sm font-medium text-muted-foreground">{item.time}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.event}</p>
                <p className="text-xs text-muted-foreground">
                  {item.patient} • {item.sector}
                </p>
              </div>
              <div
                className={`h-2 w-2 rounded-full ${
                  item.status === 'success'
                    ? 'bg-emerald-500'
                    : item.status === 'warning'
                    ? 'bg-amber-500'
                    : item.status === 'destructive'
                    ? 'bg-destructive'
                    : 'bg-primary'
                }`}
              />
            </div>
          ))}
        </div>
      </ChartCard>
    </AppLayout>
  );
}
