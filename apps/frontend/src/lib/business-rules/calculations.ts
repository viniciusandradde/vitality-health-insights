// Cálculos de KPIs e métricas

import type { Atendimento, Internacao, AmbulatorioAgendamento } from '@/types/modules';

/**
 * Calcula tempo médio de espera em minutos
 */
export function calculateTempoMedioEspera(atendimentos: Atendimento[]): number {
  const tempos = atendimentos
    .filter((a) => a.tempo_espera_minutos !== undefined && a.tempo_espera_minutos > 0)
    .map((a) => a.tempo_espera_minutos!);

  if (tempos.length === 0) return 0;

  const soma = tempos.reduce((acc, tempo) => acc + tempo, 0);
  return Math.round(soma / tempos.length);
}

/**
 * Calcula taxa de ocupação
 */
export function calculateTaxaOcupacao(ocupados: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((ocupados / total) * 100);
}

/**
 * Calcula taxa de no-show para agendamentos
 */
export function calculateTaxaNoShow(agendamentos: AmbulatorioAgendamento[]): number {
  const total = agendamentos.length;
  if (total === 0) return 0;

  const noShows = agendamentos.filter((a) => a.status === 'no_show').length;
  return Math.round((noShows / total) * 100);
}

/**
 * Calcula tempo médio de permanência em dias
 */
export function calculateTempoMedioPermanencia(internacoes: Internacao[]): number {
  const tempos = internacoes
    .filter((i) => i.dias_internacao !== undefined && i.dias_internacao > 0)
    .map((i) => i.dias_internacao!);

  if (tempos.length === 0) return 0;

  const soma = tempos.reduce((acc, tempo) => acc + tempo, 0);
  return Number((soma / tempos.length).toFixed(1));
}

/**
 * Calcula taxa de glosas
 */
export function calculateTaxaGlosas(faturamentoTotal: number, valorGlosado: number): number {
  if (faturamentoTotal === 0) return 0;
  return Number(((valorGlosado / faturamentoTotal) * 100).toFixed(2));
}

/**
 * Calcula taxa de recebimento
 */
export function calculateTaxaRecebimento(valorFaturado: number, valorRecebido: number): number {
  if (valorFaturado === 0) return 0;
  return Math.round((valorRecebido / valorFaturado) * 100);
}

/**
 * Identifica picos de demanda por hora
 */
export function identifyPicosDemanda(
  atendimentos: Atendimento[]
): { hora: string; quantidade: number }[] {
  const porHora: Record<string, number> = {};

  atendimentos.forEach((atendimento) => {
    const hora = atendimento.hora.substring(0, 2);
    porHora[hora] = (porHora[hora] || 0) + 1;
  });

  return Object.entries(porHora)
    .map(([hora, quantidade]) => ({ hora: `${hora}h`, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula distribuição por especialidade
 */
export function calculateDistribuicaoEspecialidade(
  atendimentos: Atendimento[]
): { especialidade: string; quantidade: number; percentual: number }[] {
  const porEspecialidade: Record<string, number> = {};
  const total = atendimentos.length;

  atendimentos.forEach((atendimento) => {
    porEspecialidade[atendimento.especialidade] =
      (porEspecialidade[atendimento.especialidade] || 0) + 1;
  });

  return Object.entries(porEspecialidade)
    .map(([especialidade, quantidade]) => ({
      especialidade,
      quantidade,
      percentual: Math.round((quantidade / total) * 100),
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula distribuição por convênio
 */
export function calculateDistribuicaoConvenio(
  atendimentos: Atendimento[]
): { convenio: string; quantidade: number; percentual: number }[] {
  const porConvenio: Record<string, number> = {};
  const total = atendimentos.length;

  atendimentos.forEach((atendimento) => {
    porConvenio[atendimento.convenio] = (porConvenio[atendimento.convenio] || 0) + 1;
  });

  return Object.entries(porConvenio)
    .map(([convenio, quantidade]) => ({
      convenio,
      quantidade,
      percentual: Math.round((quantidade / total) * 100),
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula saldo financeiro (receita - despesa)
 */
export function calculateSaldo(receita: number, despesa: number): number {
  return receita - despesa;
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata duração em minutos para string legível
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
