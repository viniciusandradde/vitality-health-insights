/**
 * Página principal do módulo CCIH
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard';
import { ChartCard } from '@/components/dashboard';
import { SimpleBarChart, SimpleLineChart, SimplePieChart, MultiLineChart } from '@/components/dashboard';
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
import { ShieldCheck, AlertTriangle, CheckCircle, Download, Search, Activity, FileWarning } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CCIHRecord, FilterParams, CCIHKPI, InfecaoPorTipo } from '@/types/assistencial';
import { formatDate } from '@/lib/formatters';
import { CCIH_STATUS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { assistencialApi } from '@/api/endpoints/assistencial';
import { useCCIHKPIs } from '@/hooks/use-assistencial-kpis';

export default function CCIHPage() {
  const [filters, setFilters] = useState<FilterParams>({
    period: 'month',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: kpiData, isLoading: kpisLoading, error: kpiError } = useCCIHKPIs(filters);

  const infeccoesPorTipo = [
    { name: 'PAV', value: 5 },
    { name: 'ITU', value: 4 },
    { name: 'ISC', value: 2 },
    { name: 'Bacteremia', value: 1 },
    { name: 'Outras', value: 0 },
  ];

  const evolucaoInfeccoes = [
    { dia: 'Seg', novos: 2, resolvidos: 1 },
    { dia: 'Ter', novos: 1, resolvidos: 2 },
    { dia: 'Qua', novos: 3, resolvidos: 1 },
    { dia: 'Qui', novos: 0, resolvidos: 3 },
    { dia: 'Sex', novos: 2, resolvidos: 1 },
    { dia: 'Sáb', novos: 1, resolvidos: 2 },
    { dia: 'Dom', novos: 0, resolvidos: 1 },
  ];

  const distribuicaoSeveridade = [
    { name: 'Baixa', value: 3 },
    { name: 'Média', value: 6 },
    { name: 'Alta', value: 3 },
  ];

  const { data: ccihRecords, isLoading: ccihLoading } = useQuery({
    queryKey: ['ccih', filters],
    queryFn: () => assistencialApi.getCCIH(filters),
  });

  const filteredRecords = (ccihRecords as CCIHRecord[])?.filter((record) =>
    searchTerm
      ? record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.infectionType.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <AppLayout
      title="CCIH"
      subtitle="Controle de Infecção Hospitalar"
    >
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select
            value={filters.period || 'month'}
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
              placeholder="Buscar paciente ou tipo de infecção..."
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
            title="Infecções Ativas"
            value={kpiData.por_tipo?.reduce((acc: number, item: { casos_ativos?: number }) => acc + (item.casos_ativos || 0), 0).toString() || '0'}
            icon={AlertTriangle}
            variant="warning"
          />
          <KPICard
            title="Infecções Resolvidas"
            value={kpiData.por_tipo?.reduce((acc: number, item: { casos_resolvidos?: number }) => acc + (item.casos_resolvidos || 0), 0).toString() || '0'}
            icon={CheckCircle}
            variant="success"
          />
          <KPICard
            title="Taxa de Infecção"
            value={`${(kpiData.taxa_infeccao_geral || 0).toFixed(1)}%`}
            icon={Activity}
            variant={(kpiData.taxa_infeccao_geral || 0) > 3 ? 'warning' : 'default'}
            description="do total de internações"
          />
          <KPICard
            title="Tipos de Infecção"
            value={kpiData.por_tipo?.length?.toString() || '0'}
            icon={FileWarning}
            variant="default"
            description="tipos diferentes"
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Infecções por Tipo"
          description="Top 5 tipos de infecção"
        >
          <SimpleBarChart
            data={
              kpiData?.por_tipo?.map((item: { tipo?: string; casos_ativos?: number }) => ({
                name: item.infection_type || 'N/A',
                value: item.total_casos || 0,
              })) || []
            }
            dataKey="value"
            height={250}
          />
        </ChartCard>

        <ChartCard
          title="Evolução de Infecções"
          description="Novos casos vs Resolvidos - Últimos 7 dias"
        >
          <MultiLineChart
            data={
              kpiData?.evolucao?.map((item: { date?: string; count?: number }) => ({
                dia: item.date || '',
                novos: item.novos_casos || 0,
                resolvidos: item.casos_resolvidos || 0,
              })) || []
            }
            lines={[
              { dataKey: 'novos', color: 'hsl(0, 72%, 50%)', name: 'Novos Casos' },
              { dataKey: 'resolvidos', color: 'hsl(142, 76%, 36%)', name: 'Resolvidos' },
            ]}
            xAxisKey="dia"
            height={250}
          />
        </ChartCard>
      </div>

      <div className="mb-6">
        <ChartCard
          title="Distribuição por Severidade"
          description="Severidade das infecções ativas"
        >
          <div className="flex items-center justify-center">
            <SimplePieChart data={distribuicaoSeveridade} height={250} />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {distribuicaoSeveridade.map((item, index) => (
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
        title="Registros CCIH"
        description="Lista de registros de infecção do período selecionado"
      >
        {ccihLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredRecords && filteredRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo de Infecção</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => {
                const statusConfig = CCIH_STATUS[record.status];
                const severityColors = {
                  low: 'default',
                  medium: 'warning',
                  high: 'destructive',
                };
                
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.patientName}
                    </TableCell>
                    <TableCell>{record.infectionType}</TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <Badge variant={severityColors[record.severity] as any}>
                        {record.severity === 'low' ? 'Baixa' : record.severity === 'medium' ? 'Média' : 'Alta'}
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
            Nenhum registro encontrado
          </div>
        )}
      </ChartCard>
    </AppLayout>
  );
}

