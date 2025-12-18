/**
 * Página principal do módulo Internação
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
import { BedDouble, Clock, Download, Search, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Internacao, FilterParams, InternacaoKPI, OcupacaoPorSetor } from '@/types/assistencial';
import { formatDate } from '@/lib/formatters';
import { INTERNACAO_STATUS, SECTORS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { assistencialApi } from '@/api/endpoints/assistencial';

export default function InternacaoPage() {
  const [filters, setFilters] = useState<FilterParams>({
    period: 'today',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mock KPIs - serão substituídos pela API real
  const kpis: InternacaoKPI = {
    taxaOcupacao: { value: 87.5, setor: 'Geral', total: 180, ocupados: 157 },
    leitosDisponiveis: { value: 42, total: 180, setor: 'Geral' },
    tempoMedioInternacao: { value: 5.2, unit: 'dias' },
    altasPrevistas: { value: 28, data: new Date().toISOString().split('T')[0] },
  };

  const ocupacaoPorSetor: OcupacaoPorSetor[] = [
    { setor: 'UTI', ocupados: 21, total: 24, taxa: 87.5 },
    { setor: 'Enfermaria', ocupados: 95, total: 120, taxa: 79.2 },
    { setor: 'Emergência', ocupados: 41, total: 36, taxa: 113.9 },
  ];

  const evolucaoOcupacao = [
    { dia: 'Seg', taxa: 82 },
    { dia: 'Ter', taxa: 85 },
    { dia: 'Qua', taxa: 88 },
    { dia: 'Qui', taxa: 87 },
    { dia: 'Sex', taxa: 90 },
    { dia: 'Sáb', taxa: 84 },
    { dia: 'Dom', taxa: 79 },
  ];

  const distribuicaoLeitos = [
    { name: 'Disponível', value: 42 },
    { name: 'Ocupado', value: 157 },
    { name: 'Manutenção', value: 1 },
  ];

  const { data: internacoes, isLoading: internacoesLoading } = useQuery({
    queryKey: ['internacoes', filters],
    queryFn: () => assistencialApi.getInternacoes(filters),
  });

  const filteredInternacoes = internacoes?.filter((internacao) =>
    searchTerm
      ? internacao.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internacao.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internacao.bedNumber.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <AppLayout
      title="Internação"
      subtitle="Gestão de leitos e internações"
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

          <Select
            value={filters.sector || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, sector: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector.value} value={sector.value}>
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente, leito ou setor..."
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
            title="Taxa de Ocupação"
            value={`${(kpiData.ocupacao?.taxa || 0).toFixed(1)}%`}
            icon={BedDouble}
            variant={(kpiData.ocupacao?.taxa || 0) > 85 ? 'warning' : 'default'}
            description={`${kpiData.ocupacao?.ocupados || 0} de ${kpiData.ocupacao?.total || 0} leitos`}
          />
          <KPICard
            title="Leitos Disponíveis"
            value={((kpiData.ocupacao?.total || 0) - (kpiData.ocupacao?.ocupados || 0)).toString()}
            icon={BedDouble}
            variant="success"
            description={`de ${kpiData.ocupacao?.total || 0} leitos totais`}
          />
          <KPICard
            title="Tempo Médio Internação"
            value={`${(kpiData.tempo_medio_dias || 0).toFixed(1)} dias`}
            icon={Clock}
            variant="default"
          />
          <KPICard
            title="Altas Previstas"
            value={(kpiData.altas_previstas || 0).toString()}
            icon={Calendar}
            variant="success"
            description="para hoje"
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Ocupação por Setor"
          description="Distribuição atual"
        >
          <SimpleBarChart
            data={ocupacaoPorSetor.map((item) => ({
              name: item.setor,
              value: item.taxa,
            }))}
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
          title="Distribuição de Leitos"
          description="Status atual"
        >
          <div className="flex items-center justify-center">
            <SimplePieChart data={distribuicaoLeitos} height={250} />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {distribuicaoLeitos.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: [
                      'hsl(142, 76%, 36%)',
                      'hsl(200, 98%, 39%)',
                      'hsl(38, 92%, 50%)',
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
        title="Pacientes Internados"
        description="Lista de internações ativas"
      >
        {internacoesLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredInternacoes && filteredInternacoes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Leito</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Data Admissão</TableHead>
                <TableHead>Previsão Alta</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInternacoes.map((internacao) => {
                const statusConfig = INTERNACAO_STATUS[internacao.status];
                return (
                  <TableRow key={internacao.id}>
                    <TableCell className="font-medium">
                      {internacao.patientName}
                    </TableCell>
                    <TableCell>{internacao.bedNumber}</TableCell>
                    <TableCell>{internacao.sector}</TableCell>
                    <TableCell>{formatDate(internacao.admissionDate)}</TableCell>
                    <TableCell>
                      {internacao.expectedDischargeDate
                        ? formatDate(internacao.expectedDischargeDate)
                        : '-'}
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
            Nenhuma internação encontrada
          </div>
        )}
      </ChartCard>
    </AppLayout>
  );
}

