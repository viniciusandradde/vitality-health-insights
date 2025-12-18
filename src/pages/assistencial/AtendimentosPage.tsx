/**
 * Página principal do módulo Atendimentos
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard';
import { ChartCard } from '@/components/dashboard';
import { SimpleAreaChart, SimpleBarChart, SimplePieChart, MultiLineChart } from '@/components/dashboard';
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
import { Users, Clock, Download, Search, Activity, BedDouble, AlertTriangle, Building2, Heart } from 'lucide-react';
import { useAtendimentosKPIs } from '@/hooks/use-assistencial-kpis';
import { assistencialApi } from '@/api/endpoints/assistencial';
import { useQuery } from '@tanstack/react-query';
import { Atendimento, FilterParams } from '@/types/assistencial';
import { formatDateTime, formatDuration } from '@/lib/formatters';
import { ATENDIMENTO_STATUS } from '@/lib/constants';
import { Input } from '@/components/ui/input';

export default function AtendimentosPage() {
  const [filters, setFilters] = useState<FilterParams>({
    period: 'today',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [convenioFilter, setConvenioFilter] = useState<string>('all');

  const { data: kpiData, isLoading: kpisLoading, error: kpiError } = useAtendimentosKPIs(filters);
  const { data: atendimentos, isLoading: atendimentosLoading } = useQuery({
    queryKey: ['atendimentos', filters],
    queryFn: () => assistencialApi.getAtendimentos(filters),
  });

  const { data: atendimentosPorHora, isLoading: horaLoading } = useQuery({
    queryKey: ['atendimentos-por-hora', filters],
    queryFn: () => assistencialApi.getAtendimentosPorHora(filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: ocupacaoPorConvenio, isLoading: ocupacaoConvenioLoading } = useQuery({
    queryKey: ['ocupacao-por-convenio', filters],
    queryFn: () => assistencialApi.getOcupacaoPorConvenio(filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: taxaOcupacaoLeitos, isLoading: taxaOcupacaoLoading } = useQuery({
    queryKey: ['taxa-ocupacao-leitos', filters],
    queryFn: () => assistencialApi.getTaxaOcupacaoLeitos(filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: alertasOcupacaoAlta, isLoading: alertasAltaLoading } = useQuery({
    queryKey: ['alertas-ocupacao-alta'],
    queryFn: () => assistencialApi.getOcupacaoAlta(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: alertasOcupacaoCritica, isLoading: alertasCriticaLoading } = useQuery({
    queryKey: ['alertas-ocupacao-critica'],
    queryFn: () => assistencialApi.getOcupacaoCritica(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: servicosPorEspecialidade, isLoading: servicosLoading } = useQuery({
    queryKey: ['servicos-por-especialidade', filters],
    queryFn: () => assistencialApi.getServicosPorEspecialidade(filters),
    staleTime: 5 * 60 * 1000,
  });

  const filteredAtendimentos = atendimentos?.filter((atendimento) =>
    searchTerm
      ? atendimento.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atendimento.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <AppLayout
      title="Atendimentos"
      subtitle="Análise de atendimentos em tempo real"
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
            value={convenioFilter}
            onValueChange={setConvenioFilter}
          >
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Tipo de Convênio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sus">SUS</SelectItem>
              <SelectItem value="convenios">Convênios</SelectItem>
              <SelectItem value="particulares">Particulares</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente ou especialidade..."
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
        <>
          {/* KPIs Principais */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total de Atendimentos"
              value={kpiData.total?.toString() || '0'}
              icon={Users}
              variant="default"
            />
            <KPICard
              title="Tempo Médio"
              value={kpiData.tempo_medio_minutos ? `${Math.round(kpiData.tempo_medio_minutos)} min` : '0 min'}
              icon={Clock}
              variant="default"
            />
            <KPICard
              title="Atendimentos Ativos"
              value={kpiData.ocupacao_por_especialidade?.reduce((acc: number, item) => acc + (item.ativos || 0), 0).toString() || '0'}
              icon={Activity}
              variant="default"
            />
            <KPICard
              title="Especialidades"
              value={kpiData.ocupacao_por_especialidade?.length?.toString() || '0'}
              icon={Users}
              variant="default"
            />
          </div>

          {/* KPIs por Convênio */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KPICard
              title="Atendimentos SUS"
              value={kpiData.atendimentos_sus?.toString() || '0'}
              icon={Heart}
              variant="default"
            />
            <KPICard
              title="Atendimentos Convênios"
              value={kpiData.atendimentos_convenios?.toString() || '0'}
              icon={Building2}
              variant="default"
            />
            <KPICard
              title="Atendimentos Particulares"
              value={kpiData.atendimentos_particulares?.toString() || '0'}
              icon={Users}
              variant="default"
            />
          </div>

          {/* KPIs de Leitos */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Leitos Ocupados"
              value={kpiData.leitos_ocupados?.toString() || '0'}
              icon={BedDouble}
              variant={kpiData.taxa_ocupacao_leitos && kpiData.taxa_ocupacao_leitos > 85 ? 'warning' : 'default'}
              description={`Taxa: ${kpiData.taxa_ocupacao_leitos?.toFixed(1) || 0}%`}
            />
            <KPICard
              title="Leitos Livres"
              value={kpiData.leitos_livres?.toString() || '0'}
              icon={BedDouble}
              variant="success"
              description={`de ${kpiData.leitos_total || 0} leitos totais`}
            />
            <KPICard
              title="Taxa Ocupação Leitos"
              value={`${kpiData.taxa_ocupacao_leitos?.toFixed(1) || 0}%`}
              icon={BedDouble}
              variant={
                kpiData.taxa_ocupacao_leitos && kpiData.taxa_ocupacao_leitos >= 95
                  ? 'destructive'
                  : kpiData.taxa_ocupacao_leitos && kpiData.taxa_ocupacao_leitos >= 85
                  ? 'warning'
                  : 'default'
              }
            />
            {alertasOcupacaoCritica && alertasOcupacaoCritica.length > 0 && (
              <KPICard
                title="Alertas Críticos"
                value={alertasOcupacaoCritica.length.toString()}
                icon={AlertTriangle}
                variant="destructive"
                description="Ocupação >95%"
              />
            )}
          </div>
        </>
      ) : null}

      {/* Charts Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Atendimentos por Hora"
          description="Últimas 24 horas"
        >
          {horaLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : atendimentosPorHora && atendimentosPorHora.length > 0 ? (
            <SimpleAreaChart
              data={atendimentosPorHora}
              dataKey="value"
              xAxisKey="hora"
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Atendimentos por Especialidade"
          description="Distribuição do período"
        >
          {servicosLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : servicosPorEspecialidade && servicosPorEspecialidade.length > 0 ? (
            <SimpleBarChart
              data={servicosPorEspecialidade.slice(0, 10).map((item) => ({
                name: item.especialidade,
                value: item.totalAtendimentos,
              }))}
              dataKey="value"
              height={250}
            />
          ) : (
            <SimpleBarChart
              data={
                kpiData?.ocupacao_por_especialidade?.map((item) => ({
                  name: item.specialty || 'N/A',
                  value: item.total || 0,
                })) || []
              }
              dataKey="value"
              height={250}
            />
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2 - Distribuição por Convênio */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Distribuição por Convênio"
          description="Atendimentos por tipo de convênio"
        >
          {kpisLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : kpiData ? (
            <>
              <div className="flex items-center justify-center">
                <SimplePieChart
                  data={[
                    { name: 'SUS', value: kpiData.atendimentos_sus || 0 },
                    { name: 'Convênios', value: kpiData.atendimentos_convenios || 0 },
                    { name: 'Particulares', value: kpiData.atendimentos_particulares || 0 },
                  ].filter(item => item.value > 0)}
                  height={220}
                />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {[
                  { name: 'SUS', value: kpiData.atendimentos_sus || 0 },
                  { name: 'Convênios', value: kpiData.atendimentos_convenios || 0 },
                  { name: 'Particulares', value: kpiData.atendimentos_particulares || 0 },
                ]
                  .filter(item => item.value > 0)
                  .map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: [
                            'hsl(200, 98%, 39%)',
                            'hsl(142, 76%, 36%)',
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
            </>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Ocupação de Leitos por Setor"
          description="Taxa de ocupação por centro de custo"
        >
          {taxaOcupacaoLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : taxaOcupacaoLeitos && taxaOcupacaoLeitos.length > 0 ? (
            <SimpleBarChart
              data={taxaOcupacaoLeitos.map((item) => ({
                name: item.centroCusto,
                value: item.taxaOcupacaoPercentual,
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

      {/* Charts Row 3 - Ocupação por Convênio */}
      {ocupacaoPorConvenio && ocupacaoPorConvenio.length > 0 && (
        <div className="mb-6">
          <ChartCard
            title="Ocupação de Leitos por Convênio"
            description="Análise de ocupação segmentada"
          >
            {ocupacaoConvenioLoading ? (
              <div className="flex items-center justify-center h-[250px]">
                <div className="text-muted-foreground">Carregando...</div>
              </div>
            ) : (
              <SimpleBarChart
                data={ocupacaoPorConvenio.map((item) => ({
                  name: item.convenio,
                  value: item.leitosOcupados,
                }))}
                dataKey="value"
                height={250}
              />
            )}
          </ChartCard>
        </div>
      )}

      {/* Alertas de Ocupação */}
      {(alertasOcupacaoAlta && alertasOcupacaoAlta.length > 0) ||
        (alertasOcupacaoCritica && alertasOcupacaoCritica.length > 0) ? (
        <div className="mb-6">
          <ChartCard
            title="Alertas de Ocupação"
            description="Centros com ocupação alta ou crítica"
          >
            <div className="space-y-3">
              {alertasOcupacaoCritica && alertasOcupacaoCritica.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-destructive">
                    Ocupação Crítica ({'>'}95%)
                  </h4>
                  <div className="space-y-2">
                    {alertasOcupacaoCritica.map((alerta) => (
                      <div
                        key={alerta.codigoCentroCusto}
                        className="rounded-lg border border-destructive bg-destructive/10 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{alerta.centroCusto}</p>
                            <p className="text-xs text-muted-foreground">
                              {alerta.leitosOcupados} de {alerta.totalLeitos} leitos ocupados
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-destructive">
                              {alerta.taxaOcupacaoPercentual.toFixed(1)}%
                            </p>
                            {alerta.statusOperacional && (
                              <p className="text-xs text-destructive">
                                {alerta.statusOperacional}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alertasOcupacaoAlta && alertasOcupacaoAlta.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-amber-600">
                    Ocupação Alta (85-95%)
                  </h4>
                  <div className="space-y-2">
                    {alertasOcupacaoAlta.map((alerta) => (
                      <div
                        key={alerta.codigoCentroCusto}
                        className="rounded-lg border border-amber-500 bg-amber-500/10 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{alerta.centroCusto}</p>
                            <p className="text-xs text-muted-foreground">
                              {alerta.leitosOcupados} de {alerta.totalLeitos} leitos ocupados
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-600">
                              {alerta.taxaOcupacaoPercentual.toFixed(1)}%
                            </p>
                            <p className="text-xs text-amber-600">{alerta.alerta}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      ) : null}

      {/* Table */}
      <ChartCard
        title="Atendimentos Recentes"
        description="Lista de atendimentos do período selecionado"
      >
        {atendimentosLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredAtendimentos && filteredAtendimentos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Tempo de Espera</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAtendimentos.map((atendimento) => {
                const statusConfig = ATENDIMENTO_STATUS[atendimento.status];
                return (
                  <TableRow key={atendimento.id}>
                    <TableCell className="font-medium">
                      {atendimento.patientName}
                    </TableCell>
                    <TableCell>{atendimento.specialty}</TableCell>
                    <TableCell>{atendimento.insurance}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.color as any}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(atendimento.startTime)}
                    </TableCell>
                    <TableCell>
                      {atendimento.waitTime
                        ? formatDuration(atendimento.waitTime)
                        : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum atendimento encontrado
          </div>
        )}
      </ChartCard>
    </AppLayout>
  );
}

