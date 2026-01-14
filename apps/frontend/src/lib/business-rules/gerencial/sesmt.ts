// Regras de negócio específicas para módulo de SESMT

import type { SESMTAcidente, SESMTTreinamento } from '@/types/modules';

/**
 * Calcula KPIs do módulo de SESMT
 */
export function calculateSESMTKPIs(
  acidentes: SESMTAcidente[],
  treinamentos: SESMTTreinamento[]
) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Dados do mês atual
  const acidentesMes = acidentes.filter((a) => {
    const dataAcidente = new Date(a.data);
    return dataAcidente.getMonth() === mesAtual && dataAcidente.getFullYear() === anoAtual;
  });

  const treinamentosMes = treinamentos.filter((t) => {
    const dataTreinamento = new Date(t.data);
    return dataTreinamento.getMonth() === mesAtual && dataTreinamento.getFullYear() === anoAtual;
  });

  // Custo operacional (estimado)
  const custoOperacional = (acidentesMes.length * 500) + (treinamentosMes.length * 200);

  // Índice de acidentes
  const indiceAcidentes = acidentesMes.length;

  // Relatórios de treinamento
  const relatoriosTreinamento = treinamentosMes.map((t) => ({
    tipo: t.tipo,
    participantes: t.participantes,
    centro_custo: t.centro_custo,
    data: t.data,
  }));

  // Saída de estoque (estimado baseado em acidentes e treinamentos)
  const saidaEstoque = acidentesMes.length * 10 + treinamentosMes.length * 5;

  return {
    custoOperacional,
    indiceAcidentes,
    relatoriosTreinamento,
    totalTreinamentos: treinamentosMes.length,
    totalParticipantes: treinamentosMes.reduce((sum, t) => sum + t.participantes, 0),
    saidaEstoque,
    acidentesPorGravidade: calculateAcidentesPorGravidade(acidentesMes),
  };
}

/**
 * Calcula acidentes por gravidade
 */
function calculateAcidentesPorGravidade(acidentes: SESMTAcidente[]) {
  const porGravidade: Record<string, number> = {};

  acidentes.forEach((a) => {
    porGravidade[a.gravidade] = (porGravidade[a.gravidade] || 0) + 1;
  });

  return Object.entries(porGravidade).map(([gravidade, quantidade]) => ({
    gravidade,
    quantidade,
  }));
}
