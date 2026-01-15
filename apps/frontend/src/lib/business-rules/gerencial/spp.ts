// Regras de negócio específicas para módulo de SPP (Serviço de Prontuário)

import type { SPPProntuario } from '@/types/modules';

/**
 * Calcula KPIs do módulo de SPP
 */
export function calculateSPPKPIs(prontuarios: SPPProntuario[]) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Prontuários do mês atual
  const prontuariosMes = prontuarios.filter((p) => {
    if (!p.data_arquivamento) return false;
    const dataArquivamento = new Date(p.data_arquivamento);
    return dataArquivamento.getMonth() === mesAtual && dataArquivamento.getFullYear() === anoAtual;
  });

  // Solicitações do mês atual
  const solicitacoesMes = prontuarios.filter((p) => {
    if (!p.data_solicitacao) return false;
    const dataSolicitacao = new Date(p.data_solicitacao);
    return dataSolicitacao.getMonth() === mesAtual && dataSolicitacao.getFullYear() === anoAtual;
  });

  const prontuariosArquivados = prontuariosMes.length;
  const solicitacoes = solicitacoesMes.length;

  // Tempo médio de resposta
  const temposResposta = solicitacoesMes
    .filter((p) => p.tempo_resposta !== undefined && p.tempo_resposta > 0)
    .map((p) => p.tempo_resposta!);
  
  const tempoMedioResposta = temposResposta.length > 0
    ? temposResposta.reduce((sum, t) => sum + t, 0) / temposResposta.length
    : 0;

  // Custo operacional (estimado baseado em solicitações)
  const custoOperacional = solicitacoes * 50; // Exemplo: R$ 50 por solicitação

  // Justificativas
  const justificativas = solicitacoesMes
    .filter((p) => p.justificativa)
    .map((p) => p.justificativa!);

  return {
    prontuariosArquivados,
    custoOperacional,
    solicitacoes,
    tempoMedioResposta: Number(tempoMedioResposta.toFixed(2)),
    justificativas: justificativas.reduce((acc, j) => {
      acc[j] = (acc[j] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}
