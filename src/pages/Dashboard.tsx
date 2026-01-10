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

// Sample data
const atendimentosHora = [
  { hora: '06h', value: 12 },
  { hora: '08h', value: 45 },
  { hora: '10h', value: 78 },
  { hora: '12h', value: 65 },
  { hora: '14h', value: 82 },
  { hora: '16h', value: 71 },
  { hora: '18h', value: 55 },
  { hora: '20h', value: 38 },
  { hora: '22h', value: 22 },
];

const especialidadesData = [
  { name: 'Clínica Geral', value: 245 },
  { name: 'Pediatria', value: 189 },
  { name: 'Ortopedia', value: 156 },
  { name: 'Cardiologia', value: 134 },
  { name: 'Ginecologia', value: 98 },
];

const ocupacaoSemanal = [
  { dia: 'Seg', uti: 85, enfermaria: 72, emergencia: 65 },
  { dia: 'Ter', uti: 88, enfermaria: 75, emergencia: 70 },
  { dia: 'Qua', uti: 92, enfermaria: 78, emergencia: 68 },
  { dia: 'Qui', uti: 87, enfermaria: 74, emergencia: 72 },
  { dia: 'Sex', uti: 95, enfermaria: 80, emergencia: 75 },
  { dia: 'Sáb', uti: 82, enfermaria: 68, emergencia: 60 },
  { dia: 'Dom', uti: 78, enfermaria: 62, emergencia: 55 },
];

const conveniosData = [
  { name: 'SUS', value: 45 },
  { name: 'Unimed', value: 25 },
  { name: 'Bradesco', value: 15 },
  { name: 'Particular', value: 10 },
  { name: 'Outros', value: 5 },
];

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do hospital">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select defaultValue="today">
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
          
          <Select defaultValue="all">
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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Atendimentos Hoje"
          value="847"
          icon={Users}
          trend={{ value: 12.5, label: 'vs ontem' }}
          variant="default"
        />
        <KPICard
          title="Tempo Médio Espera"
          value="32 min"
          icon={Clock}
          trend={{ value: -8.3, label: 'vs semana' }}
          variant="success"
        />
        <KPICard
          title="Taxa Ocupação UTI"
          value="87%"
          icon={BedDouble}
          trend={{ value: 3.2, label: 'vs ontem' }}
          variant="warning"
        />
        <KPICard
          title="Cirurgias Realizadas"
          value="23"
          icon={Activity}
          trend={{ value: 0, label: 'estável' }}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Leitos Disponíveis"
          value="42"
          icon={BedDouble}
          description="de 180 leitos totais"
        />
        <KPICard
          title="Agendamentos Hoje"
          value="156"
          icon={Calendar}
          trend={{ value: 5.2, label: 'vs média' }}
        />
        <KPICard
          title="Alertas Ativos"
          value="7"
          icon={AlertTriangle}
          variant="destructive"
          description="2 críticos, 5 moderados"
        />
        <KPICard
          title="Altas Previstas"
          value="28"
          icon={CheckCircle}
          variant="success"
          description="para hoje"
        />
      </div>

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
          <SimpleAreaChart data={atendimentosHora} dataKey="value" xAxisKey="hora" height={250} />
        </ChartCard>

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
      </div>

      {/* Charts Row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Top 5 Especialidades" description="Por volume de atendimentos">
          <SimpleBarChart data={especialidadesData} dataKey="value" height={220} />
        </ChartCard>

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
    </AppLayout>
  );
}
