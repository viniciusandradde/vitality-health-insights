// Regras de negócio específicas para módulo de Atendimentos

import type { Atendimento } from '@/types/modules';
import {
  calculateTempoMedioEspera,
  calculateTaxaOcupacao,
  calculateDistribuicaoEspecialidade,
  calculateDistribuicaoConvenio,
  identifyPicosDemanda,
} from '../calculations';

/**
 * Calcula KPIs do módulo de Atendimentos
 */
export function calculateAtendimentosKPIs(atendimentos: Atendimento[]) {
  const hoje = new Date().toISOString().split('T')[0];
  const atendimentosHoje = atendimentos.filter((a) => a.data === hoje);

  const emEspera = atendimentos.filter((a) => a.status === 'aguardando').length;
  const emAtendimento = atendimentos.filter((a) => a.status === 'em_atendimento').length;
  const totalAtivos = emEspera + emAtendimento;

  // Capacidade estimada (pode vir de configuração)
  const capacidadeEstimada = 100; // Exemplo

  return {
    atendimentosHoje: atendimentosHoje.length,
    tempoMedioEspera: calculateTempoMedioEspera(atendimentos),
    atendimentosAguardando: emEspera,
    taxaOcupacao: calculateTaxaOcupacao(totalAtivos, capacidadeEstimada),
    atendimentosEmAndamento: emAtendimento,
    atendimentosFinalizados: atendimentos.filter((a) => a.status === 'finalizado').length,
  };
}

/**
 * Identifica atendimentos que estão esperando há muito tempo
 */
export function identifyAtendimentosLongaEspera(
  atendimentos: Atendimento[],
  limiteMinutos: number = 60
): Atendimento[] {
  return atendimentos.filter(
    (a) =>
      a.status === 'aguardando' &&
      a.tempo_espera_minutos !== undefined &&
      a.tempo_espera_minutos > limiteMinutos
  );
}

/**
 * Calcula estatísticas por especialidade
 */
export function calculateEstatisticasPorEspecialidade(atendimentos: Atendimento[]) {
  const distribuicao = calculateDistribuicaoEspecialidade(atendimentos);

  return distribuicao.map((item) => {
    const atendimentosEspecialidade = atendimentos.filter(
      (a) => a.especialidade === item.especialidade
    );

    return {
      ...item,
      tempoMedioEspera: calculateTempoMedioEspera(atendimentosEspecialidade),
      emEspera: atendimentosEspecialidade.filter((a) => a.status === 'aguardando').length,
      finalizados: atendimentosEspecialidade.filter((a) => a.status === 'finalizado').length,
    };
  });
}

/**
 * Calcula estatísticas por convênio
 */
export function calculateEstatisticasPorConvenio(atendimentos: Atendimento[]) {
  const distribuicao = calculateDistribuicaoConvenio(atendimentos);

  return distribuicao.map((item) => {
    const atendimentosConvenio = atendimentos.filter((a) => a.convenio === item.convenio);

    return {
      ...item,
      valorTotal: atendimentosConvenio.reduce((sum, a) => sum + (a.valor || 0), 0),
      tempoMedioEspera: calculateTempoMedioEspera(atendimentosConvenio),
    };
  });
}

/**
 * Identifica padrões de demanda
 */
export function identifyPadroesDemanda(atendimentos: Atendimento[]) {
  const picos = identifyPicosDemanda(atendimentos);
  const distribuicaoEspecialidade = calculateDistribuicaoEspecialidade(atendimentos);

  return {
    horarioPico: picos[0]?.hora || 'N/A',
    quantidadePico: picos[0]?.quantidade || 0,
    especialidadeMaisDemandada: distribuicaoEspecialidade[0]?.especialidade || 'N/A',
    horariosBaixaDemanda: picos
      .filter((p) => p.quantidade < picos[0].quantidade * 0.5)
      .map((p) => p.hora),
  };
}

/**
 * Calcula KPIs específicos de Recepção PS (Pronto Socorro)
 */
export function calculateRecepcaoPSKPIs(atendimentos: Atendimento[]) {
  // Filtrar apenas atendimentos de emergência (PS)
  const atendimentosPS = atendimentos.filter((a) => a.tipo === 'emergencia');

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

  // Atendimentos do mês atual
  const atendimentosMes = atendimentosPS.filter((a) => {
    const dataAtendimento = new Date(a.data);
    return dataAtendimento.getMonth() === mesAtual && dataAtendimento.getFullYear() === anoAtual;
  });

  // Atendimentos do mês anterior
  const atendimentosMesAnterior = atendimentosPS.filter((a) => {
    const dataAtendimento = new Date(a.data);
    return dataAtendimento.getMonth() === mesAnterior && dataAtendimento.getFullYear() === anoAnterior;
  });

  // Aumento de atendimentos
  const aumentoAtendimentos = atendimentosMesAnterior.length > 0
    ? ((atendimentosMes.length - atendimentosMesAnterior.length) / atendimentosMesAnterior.length) * 100
    : 0;

  // Proporção por convênio
  const proporcaoConvenio = calculateDistribuicaoConvenio(atendimentosMes).map((item) => ({
    ...item,
    percentual: atendimentosMes.length > 0
      ? Math.round((item.quantidade / atendimentosMes.length) * 100)
      : 0,
  }));

  // Controle de fichas abertas e finalizadas
  const fichasAbertas = atendimentosMes.filter((a) => 
    a.status === 'aguardando' || a.status === 'em_atendimento'
  ).length;
  const fichasFinalizadas = atendimentosMes.filter((a) => a.status === 'finalizado').length;

  // Principais horários de picos
  const picos = identifyPicosDemanda(atendimentosMes);
  const horariosPicos = picos
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5)
    .map((p) => ({ hora: p.hora, quantidade: p.quantidade }));

  // Sazonalidade (comparar com média dos últimos 12 meses)
  const dozeMesesAtras = new Date(anoAtual, mesAtual - 11, 1);
  const atendimentosUltimos12Meses = atendimentosPS.filter((a) => {
    const dataAtendimento = new Date(a.data);
    return dataAtendimento >= dozeMesesAtras;
  });

  const mediaMensal = atendimentosUltimos12Meses.length / 12;
  const sazonalidade = mediaMensal > 0
    ? ((atendimentosMes.length - mediaMensal) / mediaMensal) * 100
    : 0;

  return {
    aumentoAtendimentos: Number(aumentoAtendimentos.toFixed(2)),
    proporcaoAtendimentosConvenio: proporcaoConvenio,
    fichasAbertas,
    fichasFinalizadas,
    horariosPicos,
    sazonalidade: Number(sazonalidade.toFixed(2)),
  };
}
