/**
 * Página principal do módulo Farmácia
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
import { Pill, AlertTriangle, Package, DollarSign, Download, Search, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Medicamento, FarmaciaKPI } from '@/types/assistencial';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { MEDICAMENTO_STATUS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { assistencialApi } from '@/api/endpoints/assistencial';
import { useFarmaciaKPIs } from '@/hooks/use-assistencial-kpis';

export default function FarmaciaPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: kpiData, isLoading: kpisLoading, error: kpiError } = useFarmaciaKPIs({
    period: 'today',
    startDate: new Date().toISOString().split('T')[0],
  });


  const distribuicaoStatus = [
    { name: 'Normal', value: 1224 },
    { name: 'Crítico', value: 23 },
    { name: 'Esgotado', value: 0 },
  ];

  const { data: medicamentos, isLoading: medicamentosLoading } = useQuery({
    queryKey: ['farmacia', categoryFilter],
    queryFn: () => assistencialApi.getFarmacia({ period: 'today' }),
  });

  const { data: medicamentosPorCategoria, isLoading: categoriaLoading } = useQuery({
    queryKey: ['farmacia-por-categoria'],
    queryFn: () => assistencialApi.getFarmaciaPorCategoria({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: evolucaoEstoque, isLoading: evolucaoLoading } = useQuery({
    queryKey: ['evolucao-estoque'],
    queryFn: () => assistencialApi.getEvolucaoEstoque(),
    staleTime: 5 * 60 * 1000,
  });

  const filteredMedicamentos = (medicamentos as Medicamento[])?.filter((medicamento) => {
    const matchesSearch = searchTerm
      ? medicamento.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicamento.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesCategory = categoryFilter === 'all' || medicamento.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout
      title="Farmácia"
      subtitle="Gestão farmacêutica"
    >
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="Medicamentos">Medicamentos</SelectItem>
              <SelectItem value="Kits Fechados">Kits Fechados</SelectItem>
              <SelectItem value="Material Hospitalar">Material Hospitalar</SelectItem>
              <SelectItem value="Materiais Diversos">Materiais Diversos</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar medicamento..."
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
            title="Total de Prescrições"
            value={kpiData.total_prescricoes?.toString() || '0'}
            icon={Package}
            variant="default"
          />
          <KPICard
            title="Medicamentos Unitários"
            value={kpiData.medicamentos_unitarios?.toString() || '0'}
            icon={ShoppingCart}
            variant="default"
          />
          <KPICard
            title="Total Medicamentos"
            value={Math.round(kpiData.medicamentos_total || 0).toString()}
            icon={Package}
            variant="default"
            description="qtd x freq"
          />
          <KPICard
            title="Setores Ativos"
            value={kpiData.por_setor?.length?.toString() || '0'}
            icon={AlertTriangle}
            variant="default"
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Medicamentos por Categoria"
          description="Distribuição de produtos"
        >
          {categoriaLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : medicamentosPorCategoria && medicamentosPorCategoria.length > 0 ? (
            <SimpleBarChart
              data={medicamentosPorCategoria}
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
          title="Evolução de Estoque"
          description="Últimos 30 dias"
        >
          {evolucaoLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : evolucaoEstoque && evolucaoEstoque.length > 0 ? (
            <SimpleLineChart
              data={evolucaoEstoque.map((item: { date?: string; value?: number }) => ({
                date: formatDate(item.date, 'dd/MM'),
                quantidade: item.quantidade,
              }))}
              dataKey="quantidade"
              xAxisKey="date"
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
          title="Distribuição por Status"
          description="Status do estoque"
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
        title="Medicamentos"
        description="Lista de medicamentos em estoque"
      >
        {medicamentosLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredMedicamentos && filteredMedicamentos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicamento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicamentos.map((medicamento) => {
                const isCritical = medicamento.quantity < 10;
                const status = isCritical ? 'critical' : 'normal';
                const statusConfig = MEDICAMENTO_STATUS[status];
                
                return (
                  <TableRow key={medicamento.id}>
                    <TableCell className="font-medium">
                      {medicamento.name}
                    </TableCell>
                    <TableCell>{medicamento.category}</TableCell>
                    <TableCell>{medicamento.quantity}</TableCell>
                    <TableCell>{medicamento.unit}</TableCell>
                    <TableCell>{formatDate(medicamento.lastUpdate)}</TableCell>
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
            Nenhum medicamento encontrado
          </div>
        )}
      </ChartCard>
    </AppLayout>
  );
}

