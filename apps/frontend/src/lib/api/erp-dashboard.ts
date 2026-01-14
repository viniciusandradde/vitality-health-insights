/**
 * Serviços de API para dashboards ERP
 */
import { apiClient } from './client';
import type {
  IndicadoresGeraisResponse,
  InternacoesDashboardResponse,
  OcupacaoLeitosDashboardResponse,
  AtendimentosDashboardResponse,
} from '@/types/erp-dashboard';

export interface DashboardQueryParams {
  periodo?: 'dia' | 'semana' | 'mes';
  setor?: string;
  centro_custo?: string;
}

/**
 * Serviço para dashboard de Indicadores Gerais
 */
export const indicadoresGeraisApi = {
  /**
   * Busca dados completos do dashboard de indicadores gerais
   */
  getDashboard: async (params?: DashboardQueryParams): Promise<IndicadoresGeraisResponse> => {
    return apiClient.get<IndicadoresGeraisResponse>(
      '/integrations/erp/dashboard/indicadores-gerais',
      {
        periodo: params?.periodo || 'dia',
        setor: params?.setor,
      }
    );
  },
};

/**
 * Serviço para dashboard de Internações
 */
export const internacoesApi = {
  /**
   * Busca dados completos do dashboard de internações
   */
  getDashboard: async (params?: DashboardQueryParams): Promise<InternacoesDashboardResponse> => {
    return apiClient.get<InternacoesDashboardResponse>(
      '/integrations/erp/dashboard/internacoes',
      {
        periodo: params?.periodo || 'mes',
        centro_custo: params?.centro_custo,
      }
    );
  },
};

/**
 * Serviço para dashboard de Ocupação de Leitos
 */
export const ocupacaoLeitosApi = {
  /**
   * Busca dados completos do dashboard de ocupação de leitos
   */
  getDashboard: async (params?: DashboardQueryParams): Promise<OcupacaoLeitosDashboardResponse> => {
    return apiClient.get<OcupacaoLeitosDashboardResponse>(
      '/integrations/erp/dashboard/ocupacao-leitos',
      {
        periodo: params?.periodo || 'mes',
        centro_custo: params?.centro_custo,
      }
    );
  },
};

/**
 * Serviço para dashboard de Atendimentos
 */
export const atendimentosApi = {
  /**
   * Busca dados completos do dashboard de atendimentos
   */
  getDashboard: async (params?: DashboardQueryParams): Promise<AtendimentosDashboardResponse> => {
    return apiClient.get<AtendimentosDashboardResponse>(
      '/integrations/erp/dashboard/atendimentos',
      {
        periodo: params?.periodo || 'mes',
        centro_custo: params?.centro_custo,
      }
    );
  },
};
