/**
 * Endpoints para KPIs agregados
 */

import { apiClient } from '../client';

export interface DashboardKPIs {
  atendimentos_hoje: number;
  tempo_medio_espera: number;
  taxa_ocupacao_uti: number;
  agendamentos_hoje: number;
  leitos_disponiveis: number;
  altas_previstas: number;
  exames_pendentes: number;
}

export interface Trend {
  value: number;
  label: string;
}

export interface OcupacaoSetor {
  setor: string;
  ocupados: number;
  total: number;
  taxa: number;
}

export interface AtendimentoHora {
  hora: string;
  value: number;
}

export interface EspecialidadeData {
  name: string;
  value: number;
}

export interface ConvenioData {
  name: string;
  value: number;
}

export const kpiApi = {
  async getDashboardKPIs(filters?: {
    period?: string;
    sector?: string;
  }): Promise<DashboardKPIs> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.sector) params.append('sector', filters.sector);

    const query = params.toString();
    return apiClient.get<DashboardKPIs>(`/api/v1/kpis/dashboard${query ? `?${query}` : ''}`);
  },

  async getModuleKPIs(
    module: string,
    filters?: { period?: string }
  ): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<any>(`/api/v1/kpis/module/${module}${query ? `?${query}` : ''}`);
  },

  async getTrends(filters?: { period?: string }): Promise<Record<string, Trend>> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<Record<string, Trend>>(`/api/v1/kpis/trends${query ? `?${query}` : ''}`);
  },

  async getOcupacaoPorSetor(filters?: { period?: string }): Promise<OcupacaoSetor[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<OcupacaoSetor[]>(`/api/v1/kpis/ocupacao${query ? `?${query}` : ''}`);
  },

  async getAtendimentosPorHora(filters?: { period?: string }): Promise<AtendimentoHora[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<AtendimentoHora[]>(`/api/v1/kpis/atendimentos-hora${query ? `?${query}` : ''}`);
  },

  async getEspecialidadesData(filters?: { period?: string }): Promise<EspecialidadeData[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<EspecialidadeData[]>(`/api/v1/kpis/especialidades${query ? `?${query}` : ''}`);
  },

  async getConveniosData(filters?: { period?: string }): Promise<ConvenioData[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<ConvenioData[]>(`/api/v1/kpis/convenios${query ? `?${query}` : ''}`);
  },
};
