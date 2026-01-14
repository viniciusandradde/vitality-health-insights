/**
 * Tipos TypeScript para os dashboards ERP
 * Baseados nos schemas Pydantic do backend
 */

// ============================================================================
// Indicadores Gerais Dashboard
// ============================================================================

export interface KPICardData {
  title: string;
  value: string;
  trend_value?: number | null;
  trend_label?: string | null;
  description?: string | null;
  variant?: string;
}

export interface AtendimentoHoraData {
  hora: string;
  value: number;
}

export interface OcupacaoSetorData {
  dia: string;
  uti: number;
  enfermaria: number;
  emergencia: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface IndicadoresGeraisResponse {
  kpis: KPICardData[];
  atendimentos_hora: AtendimentoHoraData[];
  ocupacao_semanal: OcupacaoSetorData[];
  top_especialidades: ChartData[];
  distribuicao_convenio: ChartData[];
}

// ============================================================================
// Internações Dashboard
// ============================================================================

export interface InternacoesKPIs {
  taxa_ocupacao: number;
  media_permanencia: number;
  intervalo_substituicao: number;
  rotatividade_leitos: number;
  obitos: number;
  internacoes_ps: number;
  taxa_infeccao: number;
}

export interface EntradaSaidaData {
  data: string;
  entradas: number;
  saidas: number;
}

export interface PacienteDiaLeitoDiaData {
  data: string;
  paciente_dia: number;
  leito_dia: number;
}

export interface OcupacaoCentroCustoData {
  centro_custo: string;
  leitos_cadastrados: number;
  leitos_ocupados: number;
  leitos_vagos: number;
  leitos_censo: number;
  taxa_ocupacao: number;
}

export interface ProvenienciaData {
  proveniencia: string;
  quantidade: number;
}

export interface ClassificacaoRiscoData {
  classificacao: string;
  quantidade: number;
}

export interface InternacoesDashboardResponse {
  kpis: InternacoesKPIs;
  entradas_saidas: EntradaSaidaData[];
  paciente_dia_leito_dia: PacienteDiaLeitoDiaData[];
  ocupacao_centro_custo: OcupacaoCentroCustoData[];
  top_proveniencias: ProvenienciaData[];
  classificacao_risco: ClassificacaoRiscoData[];
  internacoes_ps_medico: Record<string, any>[];
  internacoes_ps_especialidade: Record<string, any>[];
}

// ============================================================================
// Ocupação de Leitos Dashboard
// ============================================================================

export interface LeitosOperacionaisResponse {
  convenio_particular: number;
  sus: number;
  ocupado: number;
  livre: number;
  leitos_dia_sim: number;
  total_leitos: number;
}

export interface OcupacaoCentroCustoResponse {
  centro_custo: string;
  leitos_cadastrados: number;
  leitos_ocupados: number;
  leitos_vagos: number;
  leitos_censo: number;
  taxa_ocupacao: number;
}

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface TreeMapData {
  name: string;
  value: number;
}

export interface EvolucaoOcupacaoData {
  data: string;
  ocupacao: number;
  total: number;
}

export interface OcupacaoLeitosDashboardResponse {
  cards: LeitosOperacionaisResponse;
  donut_ocupacao: DonutChartData[];
  tabela_centro_custo: OcupacaoCentroCustoResponse[];
  pie_convenio: PieChartData[];
  pie_especialidade: PieChartData[];
  treemap_leito_dia: TreeMapData[];
  evolucao_ocupacao: EvolucaoOcupacaoData[];
}

// ============================================================================
// Atendimentos Dashboard
// ============================================================================

export interface AtendimentosKPIs {
  total_ambulatoriais: number;
  tipos_atendimento: number;
  top_especialidade: string;
  total_convenios: number;
}

export interface AtendimentoPorTipoData {
  name: string;
  value: number;
}

export interface AtendimentoPorConvenioData {
  convenio: string;
  total: number;
}

export interface AtendimentoPorHorarioData {
  horario: string;
  quantidade: number;
}

export interface AtendimentosDashboardResponse {
  kpis: AtendimentosKPIs;
  por_tipo: AtendimentoPorTipoData[];
  por_categoria_convenio: Record<string, number>;
  por_convenio: AtendimentoPorConvenioData[];
  por_tipo_servico: Record<string, number>;
  top_especialidades: AtendimentoPorTipoData[];
  por_faixa_etaria: Record<string, number>;
  por_horario: AtendimentoPorHorarioData[];
}
