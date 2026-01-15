// Regras de negócio específicas para módulo de Nutrição

import type { NutricaoRefeicao } from '@/types/modules';

/**
 * Calcula KPIs do módulo de Nutrição
 */
export function calculateNutricaoKPIs(refeicoes: NutricaoRefeicao[]) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Refeições do mês atual
  const refeicoesMes = refeicoes.filter((r) => {
    const dataRefeicao = new Date(r.data);
    return dataRefeicao.getMonth() === mesAtual && dataRefeicao.getFullYear() === anoAtual;
  });

  const totalRefeicoes = refeicoesMes.reduce((sum, r) => sum + r.quantidade, 0);
  const custoTotal = refeicoesMes.reduce((sum, r) => sum + r.custo, 0);
  const perdaTotal = refeicoesMes.reduce((sum, r) => sum + r.perda_marmitas, 0);
  const receitaConvenio = refeicoesMes.reduce((sum, r) => sum + r.receita_convenio, 0);
  const receitaParticular = refeicoesMes.reduce((sum, r) => sum + r.receita_particular, 0);

  // Separar por tipo
  const refeicoesPaciente = refeicoesMes.filter((r) => r.tipo === 'paciente');
  const refeicoesAcompanhante = refeicoesMes.filter((r) => r.tipo === 'acompanhante');
  const refeicoesRefeitorio = refeicoesMes.filter((r) => r.tipo === 'refeitorio');

  const custoPaciente = refeicoesPaciente.reduce((sum, r) => sum + r.custo, 0);
  const quantidadePaciente = refeicoesPaciente.reduce((sum, r) => sum + r.quantidade, 0);
  
  const custoAcompanhante = refeicoesAcompanhante.reduce((sum, r) => sum + r.custo, 0);
  const quantidadeAcompanhante = refeicoesAcompanhante.reduce((sum, r) => sum + r.quantidade, 0);
  
  const custoRefeitorio = refeicoesRefeitorio.reduce((sum, r) => sum + r.custo, 0);
  const quantidadeRefeitorio = refeicoesRefeitorio.reduce((sum, r) => sum + r.quantidade, 0);

  return {
    saidaEstoque: totalRefeicoes,
    custoPorRefeicaoPaciente: quantidadePaciente > 0 ? custoPaciente / quantidadePaciente : 0,
    custoPorRefeicaoAcompanhante: quantidadeAcompanhante > 0 ? custoAcompanhante / quantidadeAcompanhante : 0,
    custoPorRefeicaoRefeitorio: quantidadeRefeitorio > 0 ? custoRefeitorio / quantidadeRefeitorio : 0,
    receitaConvenios: receitaConvenio,
    receitaParticular: receitaParticular,
    perdaMarmitas: perdaTotal,
    perdaPercentual: totalRefeicoes > 0 ? (perdaTotal / totalRefeicoes) * 100 : 0,
  };
}
