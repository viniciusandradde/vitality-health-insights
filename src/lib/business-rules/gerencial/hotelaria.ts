// Regras de negócio específicas para módulo de Hotelaria

import type { HotelariaRouparia } from '@/types/modules';

/**
 * Calcula KPIs do módulo de Hotelaria
 */
export function calculateHotelariaKPIs(rouparias: HotelariaRouparia[]) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Rouparia do mês atual
  const roupariaMes = rouparias.filter((r) => {
    const dataRouparia = new Date(r.data);
    return dataRouparia.getMonth() === mesAtual && dataRouparia.getFullYear() === anoAtual;
  });

  // Rouparia do mês anterior para comparação
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
  const roupariaMesAnterior = rouparias.filter((r) => {
    const dataRouparia = new Date(r.data);
    return dataRouparia.getMonth() === mesAnterior && dataRouparia.getFullYear() === anoAnterior;
  });

  const solicitacaoAtual = roupariaMes.reduce((sum, r) => sum + r.quantidade, 0);
  const solicitacaoAnterior = roupariaMesAnterior.reduce((sum, r) => sum + r.quantidade, 0);
  const aumentoSolicitacao = solicitacaoAnterior > 0
    ? ((solicitacaoAtual - solicitacaoAnterior) / solicitacaoAnterior) * 100
    : 0;

  const chamadosManutencao = roupariaMes.reduce((sum, r) => sum + r.chamados_manutencao, 0);
  const perdasTotal = roupariaMes.reduce((sum, r) => sum + (r.quantidade * r.perda_percentual / 100), 0);
  const quantidadeTotal = roupariaMes.reduce((sum, r) => sum + r.quantidade, 0);
  const perdasPercentual = quantidadeTotal > 0 ? (perdasTotal / quantidadeTotal) * 100 : 0;

  // Saída de estoque (soma das quantidades)
  const saidaEstoque = solicitacaoAtual;

  return {
    aumentoSolicitacaoRouparia: Number(aumentoSolicitacao.toFixed(2)),
    chamadosManutencao,
    saidaEstoqueTecidos: saidaEstoque,
    perdasRouparia: Number(perdasPercentual.toFixed(2)),
  };
}
