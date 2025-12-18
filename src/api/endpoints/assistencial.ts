/**
 * Endpoints para módulos assistenciais
 */

import { apiClient } from '../client';
import {
  FilterParams,
  Atendimento,
  Internacao,
  Leito,
  Agendamento,
  ExameLaboratorial,
  Medicamento,
  UTIPatient,
  CCIHRecord,
  AtendimentoPorConvenio,
  LeitoDetalhado,
  OcupacaoLeitos,
  LeitosDia,
  OcupacaoPorConvenio,
  OcupacaoPorEspecialidadeLeitos,
  AlertaOcupacao,
  TotalLeitos,
  ServicosPorEspecialidade,
  AtendimentosKPI,
} from '@/types/assistencial';

export const assistencialApi = {
  // Atendimentos
  async getAtendimentos(filters?: FilterParams): Promise<Atendimento[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.insurance) params.append('insurance', filters.insurance);

    const query = params.toString();
    return apiClient.get<Atendimento[]>(`/api/v1/assistencial/atendimentos${query ? `?${query}` : ''}`);
  },

  async getAtendimentosKPI(filters?: FilterParams): Promise<AtendimentosKPI> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.specialty) params.append('specialty', filters.specialty);

    const query = params.toString();
    return apiClient.get<AtendimentosKPI>(`/api/v1/assistencial/atendimentos/kpi${query ? `?${query}` : ''}`);
  },

  async getAtendimentosPorHora(filters?: FilterParams): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<any[]>(`/api/v1/assistencial/atendimentos/por-hora${query ? `?${query}` : ''}`);
  },

  async getAtendimentosSUS(filters?: FilterParams): Promise<AtendimentoPorConvenio[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const query = params.toString();
    return apiClient.get<AtendimentoPorConvenio[]>(`/api/v1/assistencial/atendimentos/sus${query ? `?${query}` : ''}`);
  },

  async getAtendimentosConvenios(filters?: FilterParams): Promise<AtendimentoPorConvenio[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const query = params.toString();
    return apiClient.get<AtendimentoPorConvenio[]>(`/api/v1/assistencial/atendimentos/convenios${query ? `?${query}` : ''}`);
  },

  async getAtendimentosParticulares(filters?: FilterParams): Promise<AtendimentoPorConvenio[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const query = params.toString();
    return apiClient.get<AtendimentoPorConvenio[]>(`/api/v1/assistencial/atendimentos/particulares${query ? `?${query}` : ''}`);
  },

  async getLeitosOcupados(filters?: FilterParams): Promise<LeitoDetalhado[]> {
    const params = new URLSearchParams();
    if (filters?.sector) params.append('sector', filters.sector);

    const query = params.toString();
    return apiClient.get<LeitoDetalhado[]>(`/api/v1/assistencial/atendimentos/leitos/ocupados${query ? `?${query}` : ''}`);
  },

  async getLeitosLivres(filters?: FilterParams): Promise<LeitoDetalhado[]> {
    const params = new URLSearchParams();
    if (filters?.sector) params.append('sector', filters.sector);

    const query = params.toString();
    return apiClient.get<LeitoDetalhado[]>(`/api/v1/assistencial/atendimentos/leitos/livres${query ? `?${query}` : ''}`);
  },

  async getTotalLeitos(filters?: FilterParams): Promise<TotalLeitos[]> {
    const params = new URLSearchParams();
    if (filters?.sector) params.append('sector', filters.sector);

    const query = params.toString();
    return apiClient.get<TotalLeitos[]>(`/api/v1/assistencial/atendimentos/leitos/total${query ? `?${query}` : ''}`);
  },

  async getTaxaOcupacaoLeitos(filters?: FilterParams): Promise<OcupacaoLeitos[]> {
    const params = new URLSearchParams();
    if (filters?.sector) params.append('sector', filters.sector);

    const query = params.toString();
    return apiClient.get<OcupacaoLeitos[]>(`/api/v1/assistencial/atendimentos/leitos/taxa-ocupacao${query ? `?${query}` : ''}`);
  },

  async getOcupacaoPorConvenio(filters?: FilterParams): Promise<OcupacaoPorConvenio[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<OcupacaoPorConvenio[]>(`/api/v1/assistencial/atendimentos/ocupacao/convenio${query ? `?${query}` : ''}`);
  },

  async getOcupacaoPorEspecialidadeLeitos(filters?: FilterParams): Promise<OcupacaoPorEspecialidadeLeitos[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<OcupacaoPorEspecialidadeLeitos[]>(`/api/v1/assistencial/atendimentos/ocupacao/especialidade-leitos${query ? `?${query}` : ''}`);
  },

  async getLeitosDia(filters?: FilterParams): Promise<LeitosDia[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.sector) params.append('sector', filters.sector);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const query = params.toString();
    return apiClient.get<LeitosDia[]>(`/api/v1/assistencial/atendimentos/leitos-dia${query ? `?${query}` : ''}`);
  },

  async getOcupacaoAlta(): Promise<AlertaOcupacao[]> {
    return apiClient.get<AlertaOcupacao[]>(`/api/v1/assistencial/atendimentos/alertas/ocupacao-alta`);
  },

  async getOcupacaoCritica(): Promise<AlertaOcupacao[]> {
    return apiClient.get<AlertaOcupacao[]>(`/api/v1/assistencial/atendimentos/alertas/ocupacao-critica`);
  },

  async getServicosPorEspecialidade(filters?: FilterParams): Promise<ServicosPorEspecialidade[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<ServicosPorEspecialidade[]>(`/api/v1/assistencial/atendimentos/servicos/especialidade${query ? `?${query}` : ''}`);
  },

  // Internação
  async getInternacoes(filters?: FilterParams): Promise<Internacao[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.sector) params.append('sector', filters.sector);

    const query = params.toString();
    return apiClient.get<Internacao[]>(`/api/v1/assistencial/internacao${query ? `?${query}` : ''}`);
  },

  async getInternacaoKPI(filters?: FilterParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.sector) params.append('sector', filters.sector);

    const query = params.toString();
    return apiClient.get<any>(`/api/v1/assistencial/internacao/kpi${query ? `?${query}` : ''}`);
  },

  async getLeitos(sector?: string): Promise<Leito[]> {
    const params = sector ? `?sector=${sector}` : '';
    return apiClient.get<Leito[]>(`/api/v1/assistencial/internacao/leitos${params}`);
  },

  // Agendas
  async getAgendamentos(filters?: FilterParams): Promise<Agendamento[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.specialty) params.append('specialty', filters.specialty);

    const query = params.toString();
    return apiClient.get<Agendamento[]>(`/api/v1/assistencial/agendas${query ? `?${query}` : ''}`);
  },

  async getAgendasKPI(filters?: FilterParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    if (filters?.specialty) params.append('specialty', filters.specialty);

    const query = params.toString();
    return apiClient.get<any>(`/api/v1/assistencial/agendas/kpi${query ? `?${query}` : ''}`);
  },

  async getAgendamentosPorDia(filters?: FilterParams): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const query = params.toString();
    return apiClient.get<any[]>(`/api/v1/assistencial/agendas/por-dia${query ? `?${query}` : ''}`);
  },

  // Exames Laboratoriais
  async getExames(filters?: FilterParams): Promise<ExameLaboratorial[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const query = params.toString();
    return apiClient.get<ExameLaboratorial[]>(`/api/v1/assistencial/exames${query ? `?${query}` : ''}`);
  },

  async getExamesKPI(filters?: FilterParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<any>(`/api/v1/assistencial/exames/kpi${query ? `?${query}` : ''}`);
  },

  async getExamesPorTipo(filters?: FilterParams): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<any[]>(`/api/v1/assistencial/exames/por-tipo${query ? `?${query}` : ''}`);
  },

  async getEvolucaoExames(): Promise<any[]> {
    return apiClient.get<any[]>(`/api/v1/assistencial/exames/evolucao`);
  },

  // Farmácia
  async getFarmacia(filters?: FilterParams): Promise<Medicamento[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.category) params.append('category', filters.category);

    const query = params.toString();
    return apiClient.get<Medicamento[]>(`/api/v1/assistencial/farmacia${query ? `?${query}` : ''}`);
  },

  async getFarmaciaKPI(filters?: FilterParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.period) {
      // Para farmácia, usar data específica se disponível
      const data = filters.startDate || new Date().toISOString().split('T')[0];
      params.append('data', data);
    }

    const query = params.toString();
    return apiClient.get<any>(`/api/v1/assistencial/farmacia/kpi${query ? `?${query}` : ''}`);
  },

  async getFarmaciaPorCategoria(filters?: FilterParams): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const query = params.toString();
    return apiClient.get<any[]>(`/api/v1/assistencial/farmacia/por-categoria${query ? `?${query}` : ''}`);
  },

  async getEvolucaoEstoque(): Promise<any[]> {
    return apiClient.get<any[]>(`/api/v1/assistencial/farmacia/evolucao-estoque`);
  },

  // UTI
  async getUTI(filters?: FilterParams): Promise<UTIPatient[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    return apiClient.get<UTIPatient[]>(`/api/v1/assistencial/uti${query ? `?${query}` : ''}`);
  },

  async getUTIKPI(filters?: FilterParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);

    const query = params.toString();
    return apiClient.get<any>(`/api/v1/assistencial/uti/kpi${query ? `?${query}` : ''}`);
  },

  // CCIH
  async getCCIH(filters?: FilterParams): Promise<CCIHRecord[]> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    return apiClient.get<CCIHRecord[]>(`/api/v1/assistencial/ccih${query ? `?${query}` : ''}`);
  },

  async getCCIHKPI(filters?: FilterParams): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);

    const query = params.toString();
    return apiClient.get<any>(`/api/v1/assistencial/ccih/kpi${query ? `?${query}` : ''}`);
  },
};
