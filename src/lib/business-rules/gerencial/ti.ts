// Regras de negócio específicas para módulo de TI

import type { TIChamado, TIImpressao, TIEquipamento } from '@/types/modules';

/**
 * Calcula KPIs do módulo de TI
 */
export function calculateTIKPIs(
  chamados: TIChamado[],
  impressoes: TIImpressao[],
  equipamentos: TIEquipamento[]
) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Dados do mês atual
  const chamadosMes = chamados.filter((c) => {
    const dataChamado = new Date(c.data);
    return dataChamado.getMonth() === mesAtual && dataChamado.getFullYear() === anoAtual;
  });

  const impressoesMes = impressoes.filter((i) => {
    const dataImpressao = new Date(i.data);
    return dataImpressao.getMonth() === mesAtual && dataImpressao.getFullYear() === anoAtual;
  });

  // Dados dos últimos 12 meses para sazonalidade
  const dozeMesesAtras = new Date(anoAtual, mesAtual - 11, 1);
  const chamadosUltimos12Meses = chamados.filter((c) => {
    const dataChamado = new Date(c.data);
    return dataChamado >= dozeMesesAtras;
  });

  const custoOperacional = chamadosMes.length * 100; // Exemplo: R$ 100 por chamado
  const sazonalidade = calculateSazonalidade(chamadosMes, chamadosUltimos12Meses);
  const chamadosPorCentroCusto = calculateChamadosPorCentroCusto(chamadosMes);
  const impressoesPorCentroCusto = calculateImpressoesPorCentroCusto(impressoesMes);
  const computadoresAlugados = equipamentos.filter((e) => e.alugado);
  const equipamentosCriticos = equipamentos.filter((e) => e.estado === 'critico');

  return {
    custoOperacional,
    sazonalidade: Number(sazonalidade.toFixed(2)),
    chamadosPorCentroCusto,
    impressoesPorCentroCusto,
    computadoresAlugados: computadoresAlugados.map((e) => ({
      id: e.id,
      centro_custo: e.centro_custo,
      localizacao: e.localizacao,
      tipo: e.tipo,
    })),
    equipamentosCriticos: equipamentosCriticos.length,
    equipamentosCriticosDetalhes: equipamentosCriticos,
  };
}

/**
 * Calcula sazonalidade de solicitações
 */
function calculateSazonalidade(
  chamadosAtuais: TIChamado[],
  chamadosUltimos12Meses: TIChamado[]
): number {
  if (chamadosUltimos12Meses.length === 0) return 0;

  const mediaMensal = chamadosUltimos12Meses.length / 12;
  const quantidadeAtual = chamadosAtuais.length;

  if (mediaMensal === 0) return 0;

  return ((quantidadeAtual - mediaMensal) / mediaMensal) * 100;
}

/**
 * Calcula chamados por centro de custo
 */
function calculateChamadosPorCentroCusto(chamados: TIChamado[]) {
  const porCentroCusto: Record<string, number> = {};

  chamados.forEach((c) => {
    porCentroCusto[c.centro_custo] = (porCentroCusto[c.centro_custo] || 0) + 1;
  });

  return Object.entries(porCentroCusto)
    .map(([centroCusto, quantidade]) => ({
      centro_custo: centroCusto,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula impressões por centro de custo
 */
function calculateImpressoesPorCentroCusto(impressoes: TIImpressao[]) {
  const porCentroCusto: Record<string, number> = {};

  impressoes.forEach((i) => {
    porCentroCusto[i.centro_custo] = (porCentroCusto[i.centro_custo] || 0) + i.quantidade;
  });

  return Object.entries(porCentroCusto)
    .map(([centroCusto, quantidade]) => ({
      centro_custo: centroCusto,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}
