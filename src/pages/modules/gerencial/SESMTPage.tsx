import { useState } from 'react';
import { ModuleLayout } from '@/components/layout/modules';
import { KPIList, DataTable } from '@/components/modules';
import { COMMON_FILTERS } from '@/types/filters';
import type { SESMTAcidente, SESMTTreinamento, ModuleKPI, TableColumn, FilterValues } from '@/types/modules';
import { calculateSESMTKPIs } from '@/lib/business-rules';
import { HardHat, DollarSign, AlertTriangle, GraduationCap, Package } from 'lucide-react';

const mockAcidentes: SESMTAcidente[] = [
  {
    id: '1',
    data: '2024-01-10',
    tipo: 'Queda',
    gravidade: 'leve',
    centro_custo: 'Enfermaria',
  },
];

const mockTreinamentos: SESMTTreinamento[] = [
  {
    id: '1',
    data: '2024-01-10',
    tipo: 'NR-10',
    participantes: 20,
    centro_custo: 'UTI',
  },
];

export default function SESMTPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({ periodo: 'this_month' });
  const kpisCalculados = calculateSESMTKPIs(mockAcidentes, mockTreinamentos);

  const kpis: ModuleKPI[] = [
    {
      id: 'custo_operacional',
      title: 'Custo Operacional',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        kpisCalculados.custoOperacional
      ),
      icon: DollarSign,
      variant: 'default',
    },
    {
      id: 'indice_acidentes',
      title: 'Índice de Acidentes',
      value: kpisCalculados.indiceAcidentes,
      icon: AlertTriangle,
      variant: kpisCalculados.indiceAcidentes > 0 ? 'warning' : 'success',
    },
    {
      id: 'relatorios_treinamento',
      title: 'Treinamentos',
      value: kpisCalculados.totalTreinamentos,
      icon: GraduationCap,
      variant: 'default',
    },
    {
      id: 'saida_estoque',
      title: 'Saída de Estoque',
      value: kpisCalculados.saidaEstoque,
      icon: Package,
      variant: 'default',
    },
  ];

  const columns: TableColumn[] = [
    { id: 'data', label: 'Data', accessor: 'data', sortable: true },
    { id: 'tipo', label: 'Tipo', accessor: 'tipo', sortable: true },
    {
      id: 'gravidade',
      label: 'Gravidade',
      accessor: 'gravidade',
      sortable: true,
      render: (value: string) => {
        const gravidadeConfig: Record<string, { label: string; variant: string }> = {
          leve: { label: 'Leve', variant: 'default' },
          moderado: { label: 'Moderado', variant: 'warning' },
          grave: { label: 'Grave', variant: 'destructive' },
          fatal: { label: 'Fatal', variant: 'destructive' },
        };
        const config = gravidadeConfig[value] || { label: value, variant: 'default' };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              config.variant === 'warning'
                ? 'bg-amber-500/10 text-amber-600'
                : config.variant === 'destructive'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {config.label}
          </span>
        );
      },
    },
    { id: 'centro_custo', label: 'Centro de Custo', accessor: 'centro_custo', sortable: true },
  ];

  return (
    <ModuleLayout
      title="SESMT"
      subtitle="Serviço Especializado em Engenharia de Segurança e em Medicina do Trabalho"
      filters={COMMON_FILTERS}
      filterValues={filterValues}
      onFilterChange={setFilterValues}
    >
      <KPIList kpis={kpis} columns={4} />
      <DataTable columns={columns} data={mockAcidentes} searchable pagination={{ pageSize: 10 }} />
    </ModuleLayout>
  );
}
