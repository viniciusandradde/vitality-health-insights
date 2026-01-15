/**
 * Hooks React Query para dashboards ERP
 */
import { useQuery } from '@tanstack/react-query';
import {
  indicadoresGeraisApi,
  internacoesApi,
  ocupacaoLeitosApi,
  atendimentosApi,
  type DashboardQueryParams,
} from '@/lib/api/erp-dashboard';
import type {
  IndicadoresGeraisResponse,
  InternacoesDashboardResponse,
  OcupacaoLeitosDashboardResponse,
  AtendimentosDashboardResponse,
} from '@/types/erp-dashboard';

/**
 * Hook para buscar dados do dashboard de Indicadores Gerais
 */
export function useIndicadoresGerais(params?: DashboardQueryParams) {
  return useQuery<IndicadoresGeraisResponse, Error>({
    queryKey: ['erp-dashboard', 'indicadores-gerais', params],
    queryFn: () => indicadoresGeraisApi.getDashboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para buscar dados do dashboard de Internações
 */
export function useInternacoes(params?: DashboardQueryParams) {
  return useQuery<InternacoesDashboardResponse, Error>({
    queryKey: ['erp-dashboard', 'internacoes', params],
    queryFn: () => internacoesApi.getDashboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para buscar dados do dashboard de Ocupação de Leitos
 */
export function useOcupacaoLeitos(params?: DashboardQueryParams) {
  return useQuery<OcupacaoLeitosDashboardResponse, Error>({
    queryKey: ['erp-dashboard', 'ocupacao-leitos', params],
    queryFn: () => ocupacaoLeitosApi.getDashboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para buscar dados do dashboard de Atendimentos
 */
export function useAtendimentos(params?: DashboardQueryParams) {
  return useQuery<AtendimentosDashboardResponse, Error>({
    queryKey: ['erp-dashboard', 'atendimentos', params],
    queryFn: () => atendimentosApi.getDashboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}
