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
  Loader2,
} from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download } from 'lucide-react';
import { useIndicadoresGerais } from '@/hooks/useErpDashboard';

export default function IndicadoresGeraisDashboard() {
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [setor, setSetor] = useState<string | undefined>(undefined);

  const { data, isLoading, error, refetch } = useIndicadoresGerais({
    periodo: periodo === 'semana' ? 'semana' : periodo === 'mes' ? 'mes' : 'dia',
    setor: setor && setor !== 'all' ? setor : undefined,
  });

  // Mapear dados da API para o formato esperado pelos componentes
  const atendimentosHora = data?.atendimentos_hora || [];
  const especialidadesData = data?.top_especialidades || [];
  const ocupacaoSemanal = data?.ocupacao_semanal || [];
  const conveniosData = data?.distribuicao_convenio || [];

  // Converter KPIs da API para o formato do componente
  const kpis = data?.kpis || [];

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

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select
            value={periodo}
            onValueChange={(v) => setPeriodo(v as 'dia' | 'semana' | 'mes')}
          >
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Hoje</SelectItem>
              <SelectItem value="semana">Últimos 7 dias</SelectItem>
              <SelectItem value="mes">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={setor || 'all'} onValueChange={(v) => setSetor(v === 'all' ? undefined : v)}>
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
      {kpis.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, index) => {
            // Mapear ícones baseado no título
            const getIcon = () => {
              if (kpi.title.toLowerCase().includes('atendimento')) return Users;
              if (kpi.title.toLowerCase().includes('tempo') || kpi.title.toLowerCase().includes('espera')) return Clock;
              if (kpi.title.toLowerCase().includes('ocupação') || kpi.title.toLowerCase().includes('leito')) return BedDouble;
              if (kpi.title.toLowerCase().includes('cirurgia')) return Activity;
              if (kpi.title.toLowerCase().includes('agendamento')) return Calendar;
              if (kpi.title.toLowerCase().includes('alerta')) return AlertTriangle;
              if (kpi.title.toLowerCase().includes('alta')) return CheckCircle;
              return Activity;
            };

            const trend = kpi.trend_value !== null && kpi.trend_value !== undefined
              ? {
                  value: kpi.trend_value,
                  label: kpi.trend_label || '',
                }
              : undefined;

            return (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                icon={getIcon()}
                trend={trend}
                variant={kpi.variant as any}
                description={kpi.description || undefined}
              />
            );
          })}
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {atendimentosHora.length > 0 && (
          <ChartCard
            title="Atendimentos por Hora"
            description="Últimas 24 horas"
            actions={
              <Button variant="ghost" size="sm">
                Ver detalhes
              </Button>
            }
          >
            <SimpleAreaChart data={atendimentosHora} dataKey="value" xAxisKey="hora" height={250} />
          </ChartCard>
        )}

        {ocupacaoSemanal.length > 0 && (
          <ChartCard
            title="Ocupação Semanal por Setor"
            description="Comparativo de ocupação"
          >
            <MultiLineChart
              data={ocupacaoSemanal}
              xAxisKey="dia"
              height={250}
              lines={[
                { dataKey: 'uti', color: 'hsl(0, 72%, 50%)', name: 'UTI' },
                { dataKey: 'enfermaria', color: 'hsl(200, 98%, 39%)', name: 'Enfermaria' },
                { dataKey: 'emergencia', color: 'hsl(38, 92%, 50%)', name: 'Emergência' },
              ]}
            />
          </ChartCard>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {especialidadesData.length > 0 && (
          <ChartCard title="Top 5 Especialidades" description="Por volume de atendimentos">
            <SimpleBarChart data={especialidadesData} dataKey="value" height={220} />
          </ChartCard>
        )}

        {conveniosData.length > 0 && (
          <ChartCard title="Distribuição por Convênio" description="Atendimentos do mês">
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
          </ChartCard>
        )}

        <ChartCard title="Indicadores de Qualidade" description="Métricas em tempo real">
          <div className="flex flex-col items-center justify-center gap-6 py-4">
            <GaugeChart value={87} label="Taxa de Ocupação UTI" size="lg" />
            <div className="grid grid-cols-2 gap-8">
              <GaugeChart value={92} label="Satisfação" size="md" variant="success" />
              <GaugeChart value={78} label="SLA Atendimento" size="md" />
            </div>
          </div>
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
    </>
  );
}
