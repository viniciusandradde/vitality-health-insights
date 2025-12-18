/**
 * Página principal do módulo Agendas
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard';
import { ChartCard } from '@/components/dashboard';
import { SimpleAreaChart, SimpleBarChart, SimplePieChart } from '@/components/dashboard';
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
import { Calendar, CheckCircle, XCircle, Download, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Agendamento, FilterParams, AgendasKPI, AgendamentoPorDia } from '@/types/assistencial';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { AGENDAMENTO_STATUS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { assistencialApi } from '@/api/endpoints/assistencial';
import { useAgendasKPIs } from '@/hooks/use-assistencial-kpis';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AgendasPage() {
  const [filters, setFilters] = useState<FilterParams>({
    period: 'today',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: kpiData, isLoading: kpisLoading, error: kpiError } = useAgendasKPIs(filters);


  const agendamentosPorEspecialidade = [
    { name: 'Clínica Geral', value: 245 },
    { name: 'Pediatria', value: 189 },
    { name: 'Cardiologia', value: 156 },
    { name: 'Ortopedia', value: 134 },
    { name: 'Ginecologia', value: 98 },
  ];

  const distribuicaoStatus = [
    { name: 'Confirmado', value: 128 },
    { name: 'Agendado', value: 20 },
    { name: 'Completo', value: 5 },
    { name: 'Cancelado', value: 2 },
    { name: 'Falta', value: 1 },
  ];

  const { data: agendamentos, isLoading: agendamentosLoading } = useQuery({
    queryKey: ['agendamentos', filters],
    queryFn: () => assistencialApi.getAgendamentos(filters),
  });

  const { data: agendamentosPorDia, isLoading: agendamentosPorDiaLoading } = useQuery({
    queryKey: ['agendamentos-por-dia', filters],
    queryFn: () => assistencialApi.getAgendamentosPorDia(filters),
    staleTime: 5 * 60 * 1000,
  });

  const filteredAgendamentos = agendamentos?.filter((agendamento) =>
    searchTerm
      ? agendamento.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Calcular taxa de no-show a partir dos dados
  const taxaNoShow = kpiData?.taxa_comparecimento
    ? 100 - (kpiData.taxa_comparecimento.taxa || 0)
    : 0;

  return (
    <AppLayout
      title="Agendas"
      subtitle="Gestão de agendamentos"
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
              placeholder="Buscar paciente, especialidade ou médico..."
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
          <KPICard
            title="Total de Agendamentos"
            value={kpiData.total?.toString() || '0'}
            icon={Calendar}
            variant="default"
          />
          <KPICard
            title="Taxa de Comparecimento"
            value={`${(kpiData.taxa_comparecimento?.taxa || 0).toFixed(1)}%`}
            icon={CheckCircle}
            variant={(kpiData.taxa_comparecimento?.taxa || 0) > 80 ? 'success' : 'default'}
            description={`${kpiData.taxa_comparecimento?.comparecimentos || 0} de ${kpiData.taxa_comparecimento?.total || 0}`}
          />
          <KPICard
            title="Taxa de No-Show"
            value={`${taxaNoShow.toFixed(1)}%`}
            icon={XCircle}
            variant={taxaNoShow > 15 ? 'destructive' : 'warning'}
            description="Faltas ao agendamento"
          />
          <KPICard
            title="Agendados"
            value={kpiData.por_especialidade?.reduce((acc: number, item: any) => acc + (item.agendados || 0), 0).toString() || '0'}
            icon={Clock}
            variant="success"
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Agendamentos por Dia"
          description="Últimos 30 dias"
        >
          {agendamentosPorDiaLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : agendamentosPorDia && agendamentosPorDia.length > 0 ? (
            <SimpleAreaChart
              data={agendamentosPorDia.map((item: any) => ({
                date: formatDate(item.date, 'dd/MM'),
                value: item.count,
              }))}
              dataKey="value"
              xAxisKey="date"
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Agendamentos por Especialidade"
          description="Distribuição do período"
        >
          <SimpleBarChart
            data={
              kpiData?.por_especialidade?.map((item: any) => ({
                name: item.specialty || 'N/A',
                value: item.total || 0,
              })) || []
            }
            dataKey="value"
            height={250}
          />
        </ChartCard>
      </div>

      <div className="mb-6">
        <ChartCard
          title="Distribuição de Status"
          description="Status dos agendamentos de hoje"
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
                      'hsl(200, 98%, 39%)',
                      'hsl(38, 92%, 50%)',
                      'hsl(0, 72%, 50%)',
                      'hsl(262, 83%, 58%)',
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
        title="Agendamentos"
        description="Lista de agendamentos do período selecionado"
      >
        {agendamentosLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredAgendamentos && filteredAgendamentos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgendamentos.map((agendamento) => {
                const statusConfig = AGENDAMENTO_STATUS[agendamento.status];
                return (
                  <TableRow key={agendamento.id}>
                    <TableCell className="font-medium">
                      {agendamento.patientName}
                    </TableCell>
                    <TableCell>{agendamento.specialty}</TableCell>
                    <TableCell>{agendamento.doctorName}</TableCell>
                    <TableCell>
                      {formatDate(agendamento.date)} às {agendamento.time}
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
            Nenhum agendamento encontrado
          </div>
        )}
      </ChartCard>
    </AppLayout>
  );
}

