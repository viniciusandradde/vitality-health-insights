/**
 * Página principal do módulo UTI
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard';
import { ChartCard } from '@/components/dashboard';
import { SimpleBarChart, SimpleLineChart, SimplePieChart } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, AlertTriangle, Clock, BedDouble, Download, Search, Activity, AlertCircle, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UTIPatient, FilterParams, UTIKPI } from '@/types/assistencial';
import { formatDate } from '@/lib/formatters';
import { UTI_SEVERITY, UTI_STATUS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { assistencialApi } from '@/api/endpoints/assistencial';
import { useUTIKPIs } from '@/hooks/use-assistencial-kpis';

export default function UTIPage() {
  const [filters, setFilters] = useState<FilterParams>({
    period: 'today',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: kpiData, isLoading: kpisLoading, error: kpiError } = useUTIKPIs(filters);

  const ocupacaoPorSeveridade = [
    { name: 'Crítica', value: 7 },
    { name: 'Alta', value: 8 },
    { name: 'Média', value: 4 },
    { name: 'Baixa', value: 2 },
  ];

  const evolucaoOcupacao = [
    { dia: 'Seg', taxa: 85 },
    { dia: 'Ter', taxa: 88 },
    { dia: 'Qua', taxa: 92 },
    { dia: 'Qui', taxa: 87 },
    { dia: 'Sex', taxa: 90 },
    { dia: 'Sáb', taxa: 84 },
    { dia: 'Dom', taxa: 82 },
  ];

  const distribuicaoStatus = [
    { name: 'Estável', value: 12 },
    { name: 'Instável', value: 6 },
    { name: 'Crítico', value: 3 },
  ];

  const { data: utiPacientes, isLoading: utiPacientesLoading } = useQuery({
    queryKey: ['uti', filters],
    queryFn: () => assistencialApi.getUTI(filters),
  });

  const filteredPacientes = (utiPacientes as UTIPatient[])?.filter((paciente) =>
    searchTerm
      ? paciente.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.bedId.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <AppLayout
      title="UTI"
      subtitle="Unidade de Terapia Intensiva"
    >
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select
            value={filters.period || 'today'}
            onValueChange={(value) =>
              setFilters({ ...filters, period: value as FilterParams['period'] })
            }
          >
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

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente ou leito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
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
      ) : kpiError ? (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
          Erro ao carregar KPIs. Tente novamente.
        </div>
      ) : kpiData ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.ocupacao && kpiData.ocupacao.length > 0 ? (
            <>
              <KPICard
                title="Ocupação UTI"
                value={`${(kpiData.ocupacao[0]?.taxa_ocupacao || 0).toFixed(1)}%`}
                icon={Activity}
                variant={(kpiData.ocupacao[0]?.taxa_ocupacao || 0) > 85 ? 'warning' : 'default'}
                description={`${kpiData.ocupacao[0]?.leitos_ocupados || 0} de ${kpiData.ocupacao[0]?.leitos_total || 0} leitos`}
              />
              <KPICard
                title="Leitos Disponíveis"
                value={((kpiData.ocupacao[0]?.leitos_total || 0) - (kpiData.ocupacao[0]?.leitos_ocupados || 0)).toString()}
                icon={BedDouble}
                variant="success"
                description={`de ${kpiData.ocupacao[0]?.leitos_total || 0} leitos`}
              />
            </>
          ) : (
            <>
              <KPICard
                title="Ocupação UTI"
                value="0%"
                icon={Activity}
                variant="default"
              />
              <KPICard
                title="Leitos Disponíveis"
                value="0"
                icon={BedDouble}
                variant="default"
              />
            </>
          )}
          <KPICard
            title="Tempo Médio Permanência"
            value={`${(kpiData.tempo_medio_permanencia_dias || 0).toFixed(1)} dias`}
            icon={Clock}
            variant="default"
          />
          <KPICard
            title="Taxa de Mortalidade"
            value={`${(kpiData.taxa_mortalidade?.taxa || 0).toFixed(2)}%`}
            icon={AlertCircle}
            variant={kpiData.taxa_mortalidade?.taxa > 5 ? 'destructive' : 'default'}
            description={`${kpiData.taxa_mortalidade?.obitos || 0} óbitos`}
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Ocupação por Severidade"
          description="Distribuição atual"
        >
          <SimpleBarChart
            data={ocupacaoPorSeveridade}
            dataKey="value"
            height={250}
          />
        </ChartCard>

        <ChartCard
          title="Evolução de Ocupação"
          description="Últimos 7 dias"
        >
          <SimpleLineChart
            data={evolucaoOcupacao}
            dataKey="taxa"
            xAxisKey="dia"
            height={250}
          />
        </ChartCard>
      </div>

      <div className="mb-6">
        <ChartCard
          title="Distribuição de Status"
          description="Status dos pacientes UTI"
        >
          <div className="flex items-center justify-center">
            <SimplePieChart data={distribuicaoStatus} height={250} />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {distribuicaoStatus.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: [
                      'hsl(142, 76%, 36%)',
                      'hsl(38, 92%, 50%)',
                      'hsl(0, 72%, 50%)',
                    ][index],
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Table */}
      <ChartCard
        title="Pacientes UTI"
        description="Lista de pacientes na UTI"
      >
        {utiPacientesLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredPacientes && filteredPacientes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Leito</TableHead>
                <TableHead>Data Admissão</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPacientes.map((paciente) => {
                const severityConfig = UTI_SEVERITY[paciente.severity];
                const statusConfig = UTI_STATUS[paciente.status];
                
                return (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">
                      {paciente.patientName}
                    </TableCell>
                    <TableCell>{paciente.bedId}</TableCell>
                    <TableCell>{formatDate(paciente.admissionDate)}</TableCell>
                    <TableCell>
                      <Badge variant={severityConfig.color as any}>
                        {severityConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.color as any}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum paciente encontrado
          </div>
        )}
      </ChartCard>
    </AppLayout>
  );
}

