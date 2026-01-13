// Regras de negócio específicas para módulo de Agendas (expandido)

import type { AmbulatorioAgendamento } from '@/types/modules';
import { calculateAmbulatorioKPIs } from './ambulatorio';
import { identifyPicosDemanda, calculateDistribuicaoEspecialidade } from '../calculations';

/**
 * Calcula KPIs expandidos do módulo de Agendas
 */
export function calculateAgendasKPIs(agendamentos: AmbulatorioAgendamento[]) {
  const kpisBase = calculateAmbulatorioKPIs(agendamentos);

  // Taxa de confirmação
  const confirmados = agendamentos.filter((a) => a.status === 'confirmado').length;
  const totalAgendados = agendamentos.filter(
    (a) => a.status === 'agendado' || a.status === 'confirmado'
  ).length;
  const taxaConfirmacao = totalAgendados > 0 ? (confirmados / totalAgendados) * 100 : 0;

  // Taxa de cancelamentos
  const cancelados = agendamentos.filter((a) => a.status === 'cancelado').length;
  const taxaCancelamentos = agendamentos.length > 0 ? (cancelados / agendamentos.length) * 100 : 0;

  // Horários de maior demanda
  const picos = identifyPicosDemanda(agendamentos);
  const horariosMaiorDemanda = picos
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 3)
    .map((p) => p.hora);

  // Distribuição por especialidade
  const distribuicaoEspecialidade = calculateDistribuicaoEspecialidade(agendamentos);

  // Tempo médio de agendamento até atendimento
  const tempoMedioAgendamento = calculateTempoMedioAgendamento(agendamentos);

  return {
    ...kpisBase,
    taxaConfirmacao: Number(taxaConfirmacao.toFixed(2)),
    taxaCancelamentos: Number(taxaCancelamentos.toFixed(2)),
    horariosMaiorDemanda,
    distribuicaoEspecialidade,
    tempoMedioAgendamento,
  };
}

/**
 * Calcula tempo médio de agendamento até atendimento
 */
function calculateTempoMedioAgendamento(agendamentos: AmbulatorioAgendamento[]): number {
  const agendamentosCompletos = agendamentos.filter(
    (a) => a.status === 'finalizado' && a.data
  );

  if (agendamentosCompletos.length === 0) return 0;

  const hoje = new Date();
  const tempos: number[] = [];

  agendamentosCompletos.forEach((a) => {
    const dataAgendamento = new Date(a.data);
    const diffDias = Math.floor((hoje.getTime() - dataAgendamento.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias >= 0) {
      tempos.push(diffDias);
    }
  });

  if (tempos.length === 0) return 0;

  const soma = tempos.reduce((acc, tempo) => acc + tempo, 0);
  return Number((soma / tempos.length).toFixed(1));
}
