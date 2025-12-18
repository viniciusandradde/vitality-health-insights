/**
 * Página principal do módulo Exames Laboratoriais
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
import { FlaskConical, Clock, CheckCircle, Download, Search, FileText, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ExameLaboratorial, FilterParams, ExamesKPI } from '@/types/assistencial';
import { formatDateTime, formatDuration } from '@/lib/formatters';
import { EXAME_STATUS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { assistencialApi } from '@/api/endpoints/assistencial';
import { useExamesKPIs } from '@/hooks/use-assistencial-kpis';

export default function ExamesLabPage() {
  const [filters, setFilters] = useState<FilterParams>({
    period: 'today',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: kpiData, isLoading: kpisLoading, error: kpiError } = useExamesKPIs(filters);


  const distribuicaoStatus = [
    { name: 'Concluído', value: 234 },
    { name: 'Pendente', value: 47 },
    { name: 'Em Andamento', value: 12 },
    { name: 'Cancelado', value: 3 },
  ];

  const { data: exames, isLoading: examesLoading } = useQuery({
    queryKey: ['exames', filters],
    queryFn: () => assistencialApi.getExames(filters),
  });

  const { data: examesPorTipo, isLoading: examesPorTipoLoading } = useQuery({
    queryKey: ['exames-por-tipo', filters],
    queryFn: () => assistencialApi.getExamesPorTipo(filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: evolucaoExames, isLoading: evolucaoLoading } = useQuery({
    queryKey: ['evolucao-exames'],
    queryFn: () => assistencialApi.getEvolucaoExames(),
    staleTime: 5 * 60 * 1000,
  });

  const filteredExames = (exames as ExameLaboratorial[])?.filter((exame) =>
    searchTerm
      ? exame.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exame.examType.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <AppLayout
      title="Exames Laboratoriais"
      subtitle="Análise de exames"
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
              placeholder="Buscar paciente ou tipo de exame..."
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
            title="Total de Exames"
            value={kpiData.total?.toString() || '0'}
            icon={FileText}
            variant="default"
          />
          <KPICard
            title="Exames Concluídos"
            value={kpiData.taxa_conclusao?.concluidos?.toString() || '0'}
            icon={CheckCircle}
            variant="success"
            description={`de ${kpiData.taxa_conclusao?.total || 0} total`}
          />
          <KPICard
            title="Taxa de Conclusão"
            value={`${(kpiData.taxa_conclusao?.taxa || 0).toFixed(1)}%`}
            icon={Clock}
            variant={(kpiData.taxa_conclusao?.taxa || 0) > 80 ? 'success' : 'default'}
          />
          <KPICard
            title="Exames Pendentes"
            value={((kpiData.taxa_conclusao?.total || 0) - (kpiData.taxa_conclusao?.concluidos || 0)).toString()}
            icon={AlertCircle}
            variant="warning"
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Exames por Tipo"
          description="Top 8 tipos mais solicitados"
        >
          {examesPorTipoLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : examesPorTipo && examesPorTipo.length > 0 ? (
            <SimpleBarChart
              data={examesPorTipo}
              dataKey="value"
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Evolução de Exames"
          description="Solicitações vs Conclusões - Últimos 7 dias"
        >
          {evolucaoLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : evolucaoExames && evolucaoExames.length > 0 ? (
            <MultiLineChart
              data={evolucaoExames}
              lines={[
                { dataKey: 'solicitados', color: 'hsl(200, 98%, 39%)', name: 'Solicitados' },
                { dataKey: 'concluidos', color: 'hsl(142, 76%, 36%)', name: 'Concluídos' },
              ]}
              xAxisKey="dia"
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>
      </div>

      <div className="mb-6">
        <ChartCard
          title="Distribuição de Status"
          description="Status atual dos exames"
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
                      'hsl(200, 98%, 39%)',
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
        title="Exames Recentes"
        description="Lista de exames do período selecionado"
      >
        {examesLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredExames && filteredExames.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo de Exame</TableHead>
                <TableHead>Data Solicitação</TableHead>
                <TableHead>Data Conclusão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExames.map((exame) => {
                const statusConfig = EXAME_STATUS[exame.status];
                return (
                  <TableRow key={exame.id}>
                    <TableCell className="font-medium">
                      {exame.patientName}
                    </TableCell>
                    <TableCell>{exame.examType}</TableCell>
                    <TableCell>{formatDateTime(exame.requestedDate)}</TableCell>
                    <TableCell>
                      {exame.completedDate ? formatDateTime(exame.completedDate) : '-'}
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
            Nenhum exame encontrado
          </div>
        )}
      </ChartCard>
    </AppLayout>
  );
}

