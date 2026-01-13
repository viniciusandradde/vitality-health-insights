// Regras de negócio específicas para módulo de UTI

import type { UTIInternacao, UTIVentilacao } from '@/types/modules';

/**
 * Calcula KPIs do módulo de UTI
 */
export function calculateUTIKPIs(
  internacoes: UTIInternacao[],
  ventilacoes: UTIVentilacao[]
) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Dados do mês atual
  const internacoesMes = internacoes.filter((i) => {
    const dataInternacao = new Date(i.data_internacao);
    return dataInternacao.getMonth() === mesAtual && dataInternacao.getFullYear() === anoAtual;
  });

  // Leitos UTI (estimado)
  const totalLeitosUTI = 30; // Placeholder
  const leitosOcupados = internacoesMes.filter((i) => i.desfecho === 'em_internacao').length;
  
  // Taxa de ocupação
  const taxaOcupacao = totalLeitosUTI > 0
    ? (leitosOcupados / totalLeitosUTI) * 100
    : 0;

  // Tempo médio de permanência
  const tempoMedioPermanencia = calculateTempoMedioPermanencia(internacoesMes);

  // Taxa de mortalidade
  const obitos = internacoesMes.filter((i) => i.desfecho === 'obito').length;
  const taxaMortalidade = internacoesMes.length > 0
    ? (obitos / internacoesMes.length) * 100
    : 0;

  // Escore APACHE médio
  const apacheScores = internacoesMes
    .filter((i) => i.apache_score !== undefined && i.apache_score > 0)
    .map((i) => i.apache_score!);
  const apacheMedio = apacheScores.length > 0
    ? apacheScores.reduce((sum, score) => sum + score, 0) / apacheScores.length
    : 0;

  // Taxa de readmissão
  const readmissoes = internacoesMes.filter((i) => i.readmissao).length;
  const taxaReadmissao = internacoesMes.length > 0
    ? (readmissoes / internacoesMes.length) * 100
    : 0;

  // Ventilação mecânica
  const ventilacoesAtivas = ventilacoes.filter((v) => !v.data_fim);
  const tempoMedioVentilacao = calculateTempoMedioVentilacao(ventilacoes);

  // Altas da UTI
  const altas = internacoesMes.filter((i) => i.desfecho === 'alta').length;

  // Taxa de infecção na UTI (estimada - requer dados de CCIH)
  const infeccoesUTI = 5; // Placeholder - em produção viria de CCIH
  const taxaInfeccaoUTI = internacoesMes.length > 0
    ? (infeccoesUTI / internacoesMes.length) * 100
    : 0;

  return {
    taxaOcupacao: Number(taxaOcupacao.toFixed(2)),
    tempoMedioPermanencia: Number(tempoMedioPermanencia.toFixed(1)),
    taxaMortalidade: Number(taxaMortalidade.toFixed(2)),
    apacheScoreMedio: Number(apacheMedio.toFixed(1)),
    taxaReadmissao: Number(taxaReadmissao.toFixed(2)),
    ventilacaoMecanica: ventilacoesAtivas.length,
    tempoMedioVentilacao: Number(tempoMedioVentilacao.toFixed(1)),
    altasUTI: altas,
    obitosUTI: obitos,
    taxaInfeccaoUTI: Number(taxaInfeccaoUTI.toFixed(2)),
  };
}

/**
 * Calcula tempo médio de permanência
 */
function calculateTempoMedioPermanencia(internacoes: UTIInternacao[]): number {
  const internacoesCompletas = internacoes.filter(
    (i) => i.dias_permanencia !== undefined && i.dias_permanencia > 0
  );

  if (internacoesCompletas.length === 0) return 0;

  const soma = internacoesCompletas.reduce(
    (sum, i) => sum + (i.dias_permanencia || 0),
    0
  );

  return soma / internacoesCompletas.length;
}

/**
 * Calcula tempo médio de ventilação
 */
function calculateTempoMedioVentilacao(ventilacoes: UTIVentilacao[]): number {
  const ventilacoesFinalizadas = ventilacoes.filter(
    (v) => v.data_fim && v.dias_ventilacao !== undefined && v.dias_ventilacao > 0
  );

  if (ventilacoesFinalizadas.length === 0) return 0;

  const soma = ventilacoesFinalizadas.reduce(
    (sum, v) => sum + (v.dias_ventilacao || 0),
    0
  );

  return soma / ventilacoesFinalizadas.length;
}
