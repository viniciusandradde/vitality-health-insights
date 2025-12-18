/**
 * Hook para buscar e atualizar KPIs
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { KPI, KPIFilter } from '@/types/kpi';
import { kpiApi } from '@/api/endpoints/kpi';

export function useKPIs(filters?: KPIFilter) {
  return useQuery({
    queryKey: ['kpis', filters],
    queryFn: async () => {
      return kpiApi.getKPIs(filters);
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Atualizar a cada minuto
  });
}

export function useKPI(kpiId: string) {
  return useQuery({
    queryKey: ['kpi', kpiId],
    queryFn: async () => {
      return kpiApi.getKPI(kpiId);
    },
    enabled: !!kpiId,
  });
}

export function useInvalidateKPIs() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['kpis'] });
  }, [queryClient]);
}

