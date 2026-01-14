// Regras de negócio específicas para módulo de Laboratório

import type { LaboratorioExame } from '@/types/modules';
import { formatCurrency } from '../calculations';

/**
 * Calcula KPIs do módulo de Laboratório
 */
export function calculateLaboratorioKPIs(exames: LaboratorioExame[]) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Exames do mês atual
  const examesMes = exames.filter((e) => {
    const dataExame = new Date(e.data);
    return dataExame.getMonth() === mesAtual && dataExame.getFullYear() === anoAtual;
  });

  // Exames dos últimos 12 meses para sazonalidade
  const dozeMesesAtras = new Date(anoAtual, mesAtual - 11, 1);
  const examesUltimos12Meses = exames.filter((e) => {
    const dataExame = new Date(e.data);
    return dataExame >= dozeMesesAtras;
  });

  const totalExames = examesMes.length;
  const faturamentoTotal = examesMes.reduce((sum, e) => sum + e.valor, 0);
  const custoTotal = examesMes.reduce((sum, e) => sum + e.custo_estimado, 0);
  const pacientesExternos = examesMes.filter((e) => e.externo).length;

  // Distribuição por convênio
  const porConvenio = calculateExamesPorConvenio(examesMes);
  
  // Repetição de exames
  const repeticao = calculateRepeticaoExames(examesMes);
  
  // Sazonalidade
  const sazonalidade = calculateSazonalidade(examesMes, examesUltimos12Meses);

  return {
    quantidadeExamesMensais: totalExames,
    examesPorConvenioTotal: porConvenio,
    examesPorConvenioPercentual: porConvenio.map((item) => ({
      ...item,
      percentual: totalExames > 0 ? Math.round((item.quantidade / totalExames) * 100) : 0,
    })),
    faturamentoMensal: faturamentoTotal,
    faturamentoPorExame: totalExames > 0 ? faturamentoTotal / totalExames : 0,
    custoEstimadoPorExame: totalExames > 0 ? custoTotal / totalExames : 0,
    pacientesExternosTotal: pacientesExternos,
    pacientesExternosPorConvenio: calculatePacientesExternosPorConvenio(examesMes),
    repeticaoExames: repeticao,
    examesPorCentroCusto: calculateExamesPorCentroCusto(examesMes),
    sazonalidade: sazonalidade,
  };
}

/**
 * Calcula distribuição de exames por convênio
 */
export function calculateExamesPorConvenio(exames: LaboratorioExame[]) {
  const porConvenio: Record<string, number> = {};

  exames.forEach((exame) => {
    porConvenio[exame.convenio] = (porConvenio[exame.convenio] || 0) + 1;
  });

  return Object.entries(porConvenio).map(([convenio, quantidade]) => ({
    convenio,
    quantidade,
  }));
}

/**
 * Calcula repetição de exames por paciente
 */
export function calculateRepeticaoExames(exames: LaboratorioExame[]) {
  const porPaciente: Record<string, LaboratorioExame[]> = {};

  exames.forEach((exame) => {
    if (!porPaciente[exame.paciente_id]) {
      porPaciente[exame.paciente_id] = [];
    }
    porPaciente[exame.paciente_id].push(exame);
  });

  const repeticoes = Object.values(porPaciente)
    .filter((examesPaciente) => examesPaciente.length > 1)
    .map((examesPaciente) => ({
      paciente_id: examesPaciente[0].paciente_id,
      paciente_nome: examesPaciente[0].paciente_nome,
      quantidade: examesPaciente.length,
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
  examesAtuais: LaboratorioExame[],
  examesUltimos12Meses: LaboratorioExame[]
): number {
  if (examesUltimos12Meses.length === 0) return 0;

  const mediaMensal = examesUltimos12Meses.length / 12;
  const quantidadeAtual = examesAtuais.length;

  if (mediaMensal === 0) return 0;

  const variacao = ((quantidadeAtual - mediaMensal) / mediaMensal) * 100;
  return Number(variacao.toFixed(2));
}

/**
 * Calcula pacientes externos por convênio
 */
export function calculatePacientesExternosPorConvenio(exames: LaboratorioExame[]) {
  const externos = exames.filter((e) => e.externo);
  return calculateExamesPorConvenio(externos);
}

/**
 * Calcula exames por centro de custo
 */
export function calculateExamesPorCentroCusto(exames: LaboratorioExame[]) {
  const porCentroCusto: Record<string, number> = {};

  exames.forEach((exame) => {
    porCentroCusto[exame.centro_custo] = (porCentroCusto[exame.centro_custo] || 0) + 1;
  });

  return Object.entries(porCentroCusto)
    .map(([centroCusto, quantidade]) => ({
      centro_custo: centroCusto,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}
