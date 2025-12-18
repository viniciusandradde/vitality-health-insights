/**
 * Endpoints para módulos gerenciais
 */

import { apiClient } from '../client';
import { FilterParams, FinancialData, Fatura, EstoqueItem } from '@/types/gerencial';

export const gerencialApi = {
  // Financeiro
  async getFinancialData(filters?: FilterParams): Promise<FinancialData[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return apiClient.get<FinancialData[]>(`/api/v1/gerencial/financeiro${query ? `?${query}` : ''}`);
  },

  // Faturamento
  async getFaturas(filters?: FilterParams): Promise<Fatura[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return apiClient.get<Fatura[]>(`/api/v1/gerencial/faturamento${query ? `?${query}` : ''}`);
  },

  // Estoque
  async getEstoque(filters?: { category?: string }): Promise<EstoqueItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);

    const query = params.toString();
    return apiClient.get<EstoqueItem[]>(`/api/v1/gerencial/estoque${query ? `?${query}` : ''}`);
  },

  // Relatórios
  async getRelatorios(filters?: FilterParams): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    return apiClient.get<unknown[]>(`/api/v1/gerencial/relatorios${query ? `?${query}` : ''}`);
  },
};

