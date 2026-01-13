// Regras de negócio específicas para módulo de Agência Transfusional

import type { TransfusionalProcedimento } from '@/types/modules';

/**
 * Calcula KPIs do módulo de Agência Transfusional
 */
export function calculateTransfusionalKPIs(procedimentos: TransfusionalProcedimento[]) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Procedimentos do mês atual
  const procedimentosMes = procedimentos.filter((p) => {
    const dataProcedimento = new Date(p.data);
    return dataProcedimento.getMonth() === mesAtual && dataProcedimento.getFullYear() === anoAtual;
  });

  // Procedimentos dos últimos 12 meses para sazonalidade
  const dozeMesesAtras = new Date(anoAtual, mesAtual - 11, 1);
  const procedimentosUltimos12Meses = procedimentos.filter((p) => {
    const dataProcedimento = new Date(p.data);
    return dataProcedimento >= dozeMesesAtras;
  });

  const totalProcedimentos = procedimentosMes.length;
  const faturamentoTotal = procedimentosMes.reduce((sum, p) => sum + p.valor, 0);
  const custoTotal = procedimentosMes.reduce((sum, p) => sum + p.custo_estimado, 0);

  // Distribuição por convênio
  const porConvenio = calculateProcedimentosPorConvenio(procedimentosMes);
  
  // Repetição de procedimentos
  const repeticao = calculateRepeticaoProcedimentos(procedimentosMes);
  
  // Sazonalidade
  const sazonalidade = calculateSazonalidade(procedimentosMes, procedimentosUltimos12Meses);

  return {
    quantidadeProcedimentosMensais: totalProcedimentos,
    procedimentosPorConvenioTotal: porConvenio,
    procedimentosPorConvenioPercentual: porConvenio.map((item) => ({
      ...item,
      percentual: totalProcedimentos > 0 ? Math.round((item.quantidade / totalProcedimentos) * 100) : 0,
    })),
    faturamentoMensal: faturamentoTotal,
    faturamentoPorProcedimento: totalProcedimentos > 0 ? faturamentoTotal / totalProcedimentos : 0,
    custoEstimadoPorProcedimento: totalProcedimentos > 0 ? custoTotal / totalProcedimentos : 0,
    pacientesTotal: new Set(procedimentosMes.map((p) => p.paciente_id)).size,
    pacientesPorConvenio: calculatePacientesPorConvenio(procedimentosMes),
    repeticaoProcedimentos: repeticao,
    procedimentosPorCentroCusto: calculateProcedimentosPorCentroCusto(procedimentosMes),
    sazonalidade: sazonalidade,
  };
}

/**
 * Calcula distribuição de procedimentos por convênio
 */
export function calculateProcedimentosPorConvenio(procedimentos: TransfusionalProcedimento[]) {
  const porConvenio: Record<string, number> = {};

  procedimentos.forEach((procedimento) => {
    porConvenio[procedimento.convenio] = (porConvenio[procedimento.convenio] || 0) + 1;
  });

  return Object.entries(porConvenio).map(([convenio, quantidade]) => ({
    convenio,
    quantidade,
  }));
}

/**
 * Calcula repetição de procedimentos por paciente
 */
export function calculateRepeticaoProcedimentos(procedimentos: TransfusionalProcedimento[]) {
  const porPaciente: Record<string, TransfusionalProcedimento[]> = {};

  procedimentos.forEach((procedimento) => {
    if (!porPaciente[procedimento.paciente_id]) {
      porPaciente[procedimento.paciente_id] = [];
    }
    porPaciente[procedimento.paciente_id].push(procedimento);
  });

  const repeticoes = Object.values(porPaciente)
    .filter((procedimentosPaciente) => procedimentosPaciente.length > 1)
    .map((procedimentosPaciente) => ({
      paciente_id: procedimentosPaciente[0].paciente_id,
      paciente_nome: procedimentosPaciente[0].paciente_nome,
      quantidade: procedimentosPaciente.length,
    }));

  return {
    totalRepeticoes: repeticoes.length,
    mediaRepeticoes: repeticoes.length > 0
      ? repeticoes.reduce((sum, r) => sum + r.quantidade, 0) / repeticoes.length
      : 0,
    detalhes: repeticoes.sort((a, b) => b.quantidade - a.quantidade),
  };
}

/**
 * Calcula sazonalidade comparando com média dos últimos 12 meses
 */
export function calculateSazonalidade(
  procedimentosAtuais: TransfusionalProcedimento[],
  procedimentosUltimos12Meses: TransfusionalProcedimento[]
): number {
  if (procedimentosUltimos12Meses.length === 0) return 0;

  const mediaMensal = procedimentosUltimos12Meses.length / 12;
  const quantidadeAtual = procedimentosAtuais.length;

  if (mediaMensal === 0) return 0;

  const variacao = ((quantidadeAtual - mediaMensal) / mediaMensal) * 100;
  return Number(variacao.toFixed(2));
}

/**
 * Calcula pacientes por convênio
 */
export function calculatePacientesPorConvenio(procedimentos: TransfusionalProcedimento[]) {
  const porConvenio: Record<string, Set<string>> = {};

  procedimentos.forEach((procedimento) => {
    if (!porConvenio[procedimento.convenio]) {
      porConvenio[procedimento.convenio] = new Set();
    }
    porConvenio[procedimento.convenio].add(procedimento.paciente_id);
  });

  return Object.entries(porConvenio).map(([convenio, pacientes]) => ({
    convenio,
    quantidade: pacientes.size,
  }));
}

/**
 * Calcula procedimentos por centro de custo
 */
export function calculateProcedimentosPorCentroCusto(procedimentos: TransfusionalProcedimento[]) {
  const porCentroCusto: Record<string, number> = {};

  procedimentos.forEach((procedimento) => {
    porCentroCusto[procedimento.centro_custo] = (porCentroCusto[procedimento.centro_custo] || 0) + 1;
  });

  return Object.entries(porCentroCusto)
    .map(([centroCusto, quantidade]) => ({
      centro_custo: centroCusto,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}
